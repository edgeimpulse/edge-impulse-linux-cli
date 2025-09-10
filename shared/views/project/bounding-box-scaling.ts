type ResizeEnum = 'squash' | 'fit-short' | 'fit-long' | 'crop';

type BoundingBox = {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

/**
* Helper to calculate positions for predictions to be placed to the original image,
* as we need to scale the coordinates of the predictions based on the resize mode.
*/
export const mapPredictionToOriginalImage = (
    resizeMode: ResizeEnum,
    box: BoundingBox,
    img: {
        clientWidth: number,
        clientHeight: number,
        naturalWidth: number,
        naturalHeight: number,
    },
) => {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    if (resizeMode === 'squash') {
        // Just scale the coordinates to the original image ratio
        x = Math.max(0, Math.min(box.x * img.clientWidth, img.clientWidth));
        y = Math.max(0, Math.min(box.y * img.clientHeight, img.clientHeight));
        width = Math.min(box.width * img.clientWidth, img.clientWidth - x);
        height = Math.min(box.height * img.clientHeight, img.clientHeight - y);
    }
    else if (resizeMode === 'fit-short') {
        const referenceAxis = Math.min(img.clientWidth, img.clientHeight);
        // Fit-short mode, i.e. outsides of the longer axis is cropped
        const yStartPosition = getMaskSize('vertical', img);
        const xStartPosition = getMaskSize('horizontal', img);

        x = Math.max(0, Math.min(box.x * referenceAxis, referenceAxis));
        y = Math.max(0, Math.min(box.y * referenceAxis, referenceAxis));
        width = Math.min(box.width * referenceAxis, referenceAxis - x);
        height = Math.min(box.height * referenceAxis, referenceAxis - y);

        // Now translate the coordinates for where the cropped part starts
        x = x + xStartPosition;
        y = y + yStartPosition;
    }
    else if (resizeMode === 'fit-long') {
        const padding = getLetterboxSize(img);
        const ratio = img.naturalWidth / img.naturalHeight;

        if (ratio > 1) {
            // Image is wider, so vertical padding was added
            // Calculate normalized padding for the padding
            const squaredHeight = img.clientHeight + 2 * padding;
            const normalizedPadding = padding / squaredHeight;

            // Remove normalized padding from y and re-normalize to the
            // original image height (excluding the padding)
            y = (box.y - normalizedPadding) / (1 - 2 * normalizedPadding);
            x = box.x;

            // Scale normalized width and height of the bounding box
            width = box.width;
            height = box.height / (1 - 2 * normalizedPadding);

        }
        else if (ratio < 1) {
            // Image is taller, so horizontal padding was added
            // Calculate normalized padding for the padding
            const squaredWidth = img.clientWidth + 2 * padding;
            const normalizedPadding = padding / squaredWidth;

            // Remove normalized padding from x and re-normalize to the
            // original image width (excluding the padding)
            x = (box.x - normalizedPadding) / (1 - 2 * normalizedPadding);
            y = box.y;

            // Scale normalized width and height of the bounding box
            width = box.width / (1 - 2 * normalizedPadding);
            height = box.height;
        }
        else {
            x = box.x;
            y = box.y;
            width = box.width;
            height = box.height;
        }

        // Now scale the coordinates to the original image ratio
        x = Math.max(0, Math.min(x * img.clientWidth, img.clientWidth));
        y = Math.max(0, Math.min(y * img.clientHeight, img.clientHeight));
        width = Math.min(width * img.clientWidth, img.clientWidth - x);
        height = Math.min(height * img.clientHeight, img.clientHeight - y);
    }
    else if (resizeMode === 'crop') {
        // Not expected
        return { x: 0, y: 0, height: 0, width: 0 };
    }

    return { x, y, height, width };
};

// Calculates the width/height of the area to be masked (at one side).
export const getMaskSize = (
    side: 'vertical' | 'horizontal',
    img: {
        clientWidth: number,
        clientHeight: number,
        naturalWidth: number,
        naturalHeight: number,
    },
) => {
    let maskSize = 0;
    if (side === 'horizontal' && img.clientWidth > img.clientHeight) {
        const factor = img.naturalWidth / img.naturalHeight;
        const maskedTotalWidth = img.clientWidth - (img.clientWidth / factor);
        maskSize = Math.floor(maskedTotalWidth / 2);
    }
    else if (side === 'vertical' && img.clientHeight > img.clientWidth) {
        const factor = img.naturalHeight / img.naturalWidth;
        const maskedTotalHeight = img.clientHeight - (img.clientHeight / factor);
        maskSize = Math.floor(maskedTotalHeight / 2);
    }
    return maskSize;
};

// Calculates the width/height to make the image squared (at one side).
const getLetterboxSize = (
    img: {
        clientWidth: number,
        clientHeight: number,
        naturalWidth: number,
        naturalHeight: number,
    },
) => {
    let maskSize = 0;
    const ratio = img.naturalWidth / img.naturalHeight;

    if (ratio > 1) {
        // Image is wider, calculate vertical padding to make it square
        const maskedTotalHeight = img.clientWidth - (img.clientWidth / ratio);
        maskSize = Math.floor(maskedTotalHeight / 2);
    }
    else if (ratio < 1) {
        // Image is taller, calculate horizontal padding to make it square
        const maskedTotalWidth = img.clientHeight - (img.clientHeight * ratio);
        maskSize = Math.floor(maskedTotalWidth / 2);
    }
    return maskSize;
};

export const mapStructuredResultsBoundingBox = (opts: {
    box: { ymin: number, xmin: number, ymax: number, xmax: number },
    originalWidth: number,
    originalHeight: number,
    mode: ResizeEnum,
}) => {
    const bb = mapPredictionToOriginalImage(opts.mode, {
        label: 'test',
        x: opts.box.xmin,
        y: opts.box.ymin,
        width: (opts.box.xmax - opts.box.xmin),
        height: (opts.box.ymax - opts.box.ymin),
    }, {
        naturalWidth: opts.originalWidth,
        naturalHeight: opts.originalHeight,
        clientWidth: opts.originalWidth,
        clientHeight: opts.originalHeight,
    });

    return {
        x: Math.round(bb.x),
        y: Math.round(bb.y),
        width: Math.round(bb.width),
        height: Math.round(bb.height),
    };
};

export const mapResizedPixelResultsBoundingBox = (opts: {
    box: { x: number, y: number, width: number, height: number },
    resized: {
        originalWidth: number,
        originalHeight: number,
        newWidth: number,
        newHeight: number,
    },
    mode: ResizeEnum,
}) => {
    const bb = mapPredictionToOriginalImage(opts.mode, {
        label: 'test',
        x: opts.box.x / opts.resized.newWidth,
        y: opts.box.y / opts.resized.newHeight,
        width: opts.box.width / opts.resized.newWidth,
        height: opts.box.height / opts.resized.newHeight,
    }, {
        naturalWidth: opts.resized.originalWidth,
        naturalHeight: opts.resized.originalHeight,
        clientWidth: opts.resized.originalWidth,
        clientHeight: opts.resized.originalHeight,
    });

    return {
        x: Math.round(bb.x),
        y: Math.round(bb.y),
        width: Math.round(bb.width),
        height: Math.round(bb.height),
    };
};
