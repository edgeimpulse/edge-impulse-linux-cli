type ResizeEnum = 'squash' | 'fit-short' | 'fit-long' | 'crop';

type BoundingBox = {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

/**
 * Maps a predicted bounding box from reference output coordinates to client image coordinates,
 * adjusting for the resize mode. This is necessary because the reference image dimensions
 * that the bounding boxes are relative to may differ from the displayed image due to cropping
 * and resizing.
 *
 * Supported resize modes:
 * - 'squash': The image is resized to fit the client image exactly, potentially distorting the aspect ratio.
 * - 'fit-short': The shorter axis is fit to the client image, cropping the longer axis to maintain aspect ratio.
 * - 'fit-long': The longer axis is fit to the client image, padding the shorter axis to maintain aspect ratio.
 * - 'crop': Deprecated mode; returns a zeroed bounding box.
 *
 * @param resizeMode - The resize mode used during preprocessing.
 * @param box - The predicted bounding box from the model, with normalized coordinates (0 to 1).
 * @param img - Image dimension information:
 *   - clientWidth: The target width of the image as displayed on the client.
 *   - clientHeight: The target height of the image as displayed on the client.
 *   - referenceWidth: The width of the image used as the reference for bounding box predictions.
 *   - referenceHeight: The height of the image used as the reference for bounding box predictions.
 * @returns An object containing the mapped bounding box coordinates in pixel units for display in the client:
 *   - x: The x-coordinate of the top-left corner in pixels.
 *   - y: The y-coordinate of the top-left corner in pixels.
 *   - width: The width of the bounding box in pixels.
 *   - height: The height of the bounding box in pixels.
 */
export const mapPredictionToOriginalImage = (
    resizeMode: ResizeEnum,
    box: BoundingBox,
    img: {
        // The target image dimensions. These represent the size of the image as rendered on the
        // client, and are the target for scaling the bounding box coordinates to.
        clientWidth: number,
        clientHeight: number,

        // The reference dimensions for bounding box predictions. All bounding box predictions are
        // relative to these image dimensions. In cases without a DSP step (e.g., Linux runner),
        // this is the original image size. On the live classification page, this is the DSP output
        // size. Bounding boxes are mapped from these reference dimensions to the client dimensions.
        referenceWidth: number,
        referenceHeight: number,
    }
) => {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    if (resizeMode === 'squash') {
        // Simple proportional scale from reference dimensions to client dimensions
        const scaleX = img.clientWidth / img.referenceWidth;
        const scaleY = img.clientHeight / img.referenceHeight;
        x = Math.max(0, Math.min(box.x * img.referenceWidth * scaleX, img.clientWidth));
        y = Math.max(0, Math.min(box.y * img.referenceHeight * scaleY, img.clientHeight));
        width = Math.min(box.width * img.referenceWidth * scaleX, img.clientWidth - x);
        height = Math.min(box.height * img.referenceHeight * scaleY, img.clientHeight - y);
    }
    else if (resizeMode === 'fit-short') {
        // Fit-short: crop the longer axis, scale by the shorter axis, but use reference aspect ratio
        const referenceAspectRatio = img.referenceWidth / img.referenceHeight;
        const clientAspectRatio = img.clientWidth / img.clientHeight;

        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        if (clientAspectRatio > referenceAspectRatio) {
            // Client image is wider than reference image => crop width
            scale = img.clientHeight / img.referenceHeight;
            const cropWidth = img.clientWidth - img.referenceWidth * scale;
            offsetX = cropWidth / 2;
        }
        else {
            // Client image is taller than reference image => crop height
            scale = img.clientWidth / img.referenceWidth;
            const cropHeight = img.clientHeight - img.referenceHeight * scale;
            offsetY = cropHeight / 2;
        }
        x = Math.max(0, Math.min(box.x * img.referenceWidth * scale + offsetX, img.clientWidth));
        y = Math.max(0, Math.min(box.y * img.referenceHeight * scale + offsetY, img.clientHeight));
        width = Math.min(box.width * img.referenceWidth * scale, img.clientWidth - x);
        height = Math.min(box.height * img.referenceHeight * scale, img.clientHeight - y);
    }
    else if (resizeMode === 'fit-long') {
        // Fit-long: pad the shorter axis, scale by the longer axis, use reference aspect ratio
        const referenceAspectRatio = img.referenceWidth / img.referenceHeight;
        const clientAspectRatio = img.clientWidth / img.clientHeight;
        let scale = 1;
        let padX = 0;
        let padY = 0;
        if (clientAspectRatio > referenceAspectRatio) {
            // Client image is wider than reference image => scale by width, pad the height
            scale = img.clientWidth / img.referenceWidth;
            const padHeight = img.clientHeight - img.referenceHeight * scale;
            padY = padHeight / 2;
            x = Math.max(0, Math.min(box.x * img.referenceWidth * scale, img.clientWidth));
            y = Math.max(0, Math.min(box.y * img.referenceHeight * scale + padY, img.clientHeight));
            width = Math.min(box.width * img.referenceWidth * scale, img.clientWidth - x);
            height = Math.min(box.height * img.referenceHeight * scale, img.clientHeight - y);
        }
        else {
            // Client image is taller than reference image => scale by height, pad the width
            scale = img.clientHeight / img.referenceHeight;
            const padWidth = img.clientWidth - img.referenceWidth * scale;
            padX = padWidth / 2;
            x = Math.max(0, Math.min(box.x * img.referenceWidth * scale + padX, img.clientWidth));
            y = Math.max(0, Math.min(box.y * img.referenceHeight * scale, img.clientHeight));
            width = Math.min(box.width * img.referenceWidth * scale, img.clientWidth - x);
            height = Math.min(box.height * img.referenceHeight * scale, img.clientHeight - y);
        }
    }
    else if (resizeMode === 'crop') {
        // Not expected
        return { x: 0, y: 0, height: 0, width: 0 };
    }

    return { x, y, height, width };
};

// Calculates the width/height of the area to be masked (at one side).
export const getMaskPercent = (
    side: 'vertical' | 'horizontal',
    img: {
        clientWidth: number,
        clientHeight: number,
        referenceWidth: number,
        referenceHeight: number,
    },
) => {
    // Use reference aspect ratio to determine mask size as a percentage
    const referenceAspect = img.referenceWidth / img.referenceHeight;
    const clientAspect = img.clientWidth / img.clientHeight;
    let percent = 0;
    if (side === 'horizontal' && clientAspect > referenceAspect) {
        // Image is wider than reference: mask left/right
        const displayWidth = img.clientHeight * referenceAspect;
        percent = ((img.clientWidth - displayWidth) / 2) / img.clientWidth * 100;
    }
    else if (side === 'vertical' && clientAspect < referenceAspect) {
        // Image is taller than reference: mask top/bottom
        const displayHeight = img.clientWidth / referenceAspect;
        percent = ((img.clientHeight - displayHeight) / 2) / img.clientHeight * 100;
    }
    return percent;
};

export const maskCropped = (els: {
    maskLeft: HTMLElement,
    maskRight: HTMLElement,
    maskTop: HTMLElement,
    maskBottom: HTMLElement,
}, img: {
    clientWidth: number,
    clientHeight: number,
    referenceWidth: number,
    referenceHeight: number,
}) => {
    const referenceAspect = img.referenceWidth / img.referenceHeight;
    const clientAspect = img.clientWidth / img.clientHeight;

    if (clientAspect > referenceAspect) {
        // Image is wider than reference: mask left/right
        const maskPercent = getMaskPercent('horizontal', img);
        els.maskLeft.style.width = els.maskRight.style.width = maskPercent + '%';
        els.maskTop.style.height = els.maskBottom.style.height = '0%';
        els.maskLeft.style.height = els.maskRight.style.height = '100%';
    }
    else if (clientAspect < referenceAspect) {
        // Image is taller than reference: mask top/bottom
        const maskPercent = getMaskPercent('vertical', img);
        els.maskLeft.style.width = els.maskRight.style.width = '0%';
        els.maskTop.style.height = els.maskBottom.style.height = maskPercent + '%';
        els.maskTop.style.width = els.maskBottom.style.width = '100%';
    }
    else {
        // Aspect ratios match: no mask
        els.maskLeft.style.width = els.maskRight.style.width = '0%';
        els.maskTop.style.height = els.maskBottom.style.height = '0%';
    }
};

