// data/cloudRegions.ts
import type { CloudProvider } from "./exchanges";

export type CloudRegion = {
    id: string;
    provider: CloudProvider;
    name: string;
    regionCode: string;
    lat: number;
    lng: number;
};

export const cloudRegions: CloudRegion[] = [
    // AWS
    {
        id: "aws-mumbai",
        provider: "AWS",
        name: "AWS Mumbai",
        regionCode: "ap-south-1",
        lat: 19.076,
        lng: 72.8777,
    },
    {
        id: "aws-frankfurt",
        provider: "AWS",
        name: "AWS Frankfurt",
        regionCode: "eu-central-1",
        lat: 50.1109,
        lng: 8.6821,
    },
    {
        id: "aws-virginia",
        provider: "AWS",
        name: "AWS N. Virginia",
        regionCode: "us-east-1",
        lat: 39.0438,
        lng: -77.4874,
    },

    // GCP
    {
        id: "gcp-singapore",
        provider: "GCP",
        name: "GCP Singapore",
        regionCode: "asia-southeast1",
        lat: 1.3521,
        lng: 103.8198,
    },
    {
        id: "gcp-frankfurt",
        provider: "GCP",
        name: "GCP Frankfurt",
        regionCode: "europe-west3",
        lat: 50.1109,
        lng: 8.6821,
    },

    // Azure
    {
        id: "azure-frankfurt",
        provider: "AZURE",
        name: "Azure Germany West Central",
        regionCode: "de-west-central",
        lat: 50.1109,
        lng: 8.6821,
    },
    {
        id: "azure-london",
        provider: "AZURE",
        name: "Azure UK South",
        regionCode: "uk-south",
        lat: 51.5072,
        lng: -0.1276,
    },
];
