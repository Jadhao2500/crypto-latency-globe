// data/exchanges.ts
export type CloudProvider = "AWS" | "GCP" | "AZURE";

export type Exchange = {
    id: string;
    name: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
    provider: CloudProvider;
    regionCode: string;
};

export const exchanges: Exchange[] = [
    {
        id: "binance-tokyo",
        name: "Binance",
        city: "Tokyo",
        country: "Japan",
        lat: 35.6762,
        lng: 139.6503,
        provider: "AWS",
        regionCode: "ap-northeast-1",
    },
    {
        id: "okx-singapore",
        name: "OKX",
        city: "Singapore",
        country: "Singapore",
        lat: 1.3521,
        lng: 103.8198,
        provider: "GCP",
        regionCode: "asia-southeast1",
    },
    {
        id: "deribit-amsterdam",
        name: "Deribit",
        city: "Amsterdam",
        country: "Netherlands",
        lat: 52.3676,
        lng: 4.9041,
        provider: "AWS",
        regionCode: "eu-west-1",
    },
    {
        id: "bybit-frankfurt",
        name: "Bybit",
        city: "Frankfurt",
        country: "Germany",
        lat: 50.1109,
        lng: 8.6821,
        provider: "AZURE",
        regionCode: "eu-central",
    },
    {
        id: "binance-virginia",
        name: "Binance",
        city: "Ashburn",
        country: "USA",
        lat: 39.0438,
        lng: -77.4874,
        provider: "AWS",
        regionCode: "us-east-1",
    },
];
