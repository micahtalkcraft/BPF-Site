export const REGION_CODES = ["us", "uk", "ca", "in"] as const;
export type RegionCode = (typeof REGION_CODES)[number];

export interface RegionConfig {
  code: RegionCode;
  subdomain: string;
  locale: string;
  currency: string;
  hreflang: string;
  label: string;
}

export const regions: Record<RegionCode, RegionConfig> = {
  us: {
    code: "us",
    subdomain: "us.bestpropfirms.com",
    locale: "en-US",
    currency: "USD",
    hreflang: "en-us",
    label: "United States",
  },
  uk: {
    code: "uk",
    subdomain: "uk.bestpropfirms.com",
    locale: "en-GB",
    currency: "GBP",
    hreflang: "en-gb",
    label: "United Kingdom",
  },
  ca: {
    code: "ca",
    subdomain: "ca.bestpropfirms.com",
    locale: "en-CA",
    currency: "CAD",
    hreflang: "en-ca",
    label: "Canada",
  },
  in: {
    code: "in",
    subdomain: "in.bestpropfirms.com",
    locale: "en-IN",
    currency: "INR",
    hreflang: "en-in",
    label: "India",
  },
};
