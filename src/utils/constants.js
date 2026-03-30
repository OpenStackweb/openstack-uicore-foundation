export const CENTS_FACTOR = 100n;
export const TWO_DECIMAL_PLACES = 2;
export const THREE_DECIMAL_PLACES = 3;
export const ONE_CENT = 1n;
export const ZERO_INT = 0;

export const CODE_200 = 200;

export const DEBOUNCE_WAIT_250 = 250;
export const DEBOUNCE_WAIT = 500;

export const NOTIFICATION_TIMEOUT = 2000;
export const DEFAULT_PER_PAGE = 10;
export const TWENTY_PER_PAGE = 20;
export const FIFTY_PER_PAGE = 50;
export const MAX_PER_PAGE = 100;

export const INT_BASE = 10;

export const ONE_HUNDRED = 100;
export const MILLISECONDS_IN_SECOND = 1000;

export const MILLISECONDS_TO_SECONDS = 1000;

export const BYTES_PER_MB = 1_048_576; // 1024 * 1024

export const MAX_INVENTORY_IMAGE_UPLOAD_SIZE = 512000;
export const MAX_INVENTORY_IMAGES_UPLOAD_QTY = 5;
export const ALLOWED_INVENTORY_IMAGE_FORMATS = ["jpg", "jpeg", "png"];

export const METAFIELD_TYPES_WITH_OPTIONS = [
  "CheckBoxList",
  "ComboBox",
  "RadioButtonList"
];

export const METAFIELD_TYPES = [
  "CheckBox",
  ...METAFIELD_TYPES_WITH_OPTIONS,
  "Text",
  "TextArea",
  "Quantity",
  "DateTime",
  "Time"
];

export const DISCOUNT_TYPES = {
  AMOUNT: "Amount",
  RATE: "Rate"
};

export const RATE_FIELDS = {
    EARLY_BIRD: "early_bird_rate",
    STANDARD: "standard_rate",
    ONSITE: "onsite_rate"
};
