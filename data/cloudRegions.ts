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
    // ---------- AWS ----------
    { id: "aws-mumbai", provider: "AWS", name: "AWS Mumbai", regionCode: "ap-south-1", lat: 19.076, lng: 72.8777 },
    { id: "aws-frankfurt", provider: "AWS", name: "AWS Frankfurt", regionCode: "eu-central-1", lat: 50.1109, lng: 8.6821 },
    { id: "aws-virginia", provider: "AWS", name: "AWS N. Virginia", regionCode: "us-east-1", lat: 39.0438, lng: -77.4874 },
    { id: "aws-ohio", provider: "AWS", name: "AWS Ohio", regionCode: "us-east-2", lat: 40.4173, lng: -82.9071 },
    { id: "aws-singapore", provider: "AWS", name: "AWS Singapore", regionCode: "ap-southeast-1", lat: 1.3521, lng: 103.8198 },
    { id: "aws-seattle", provider: "AWS", name: "AWS Oregon", regionCode: "us-west-2", lat: 45.5152, lng: -122.6784 },

    // ---------- GCP ----------
    { id: "gcp-singapore", provider: "GCP", name: "GCP Singapore", regionCode: "asia-southeast1", lat: 1.3521, lng: 103.8198 },
    { id: "gcp-frankfurt", provider: "GCP", name: "GCP Frankfurt", regionCode: "europe-west3", lat: 50.1109, lng: 8.6821 },
    { id: "gcp-tokyo", provider: "GCP", name: "GCP Tokyo", regionCode: "asia-northeast1", lat: 35.6762, lng: 139.6503 },
    { id: "gcp-iowa", provider: "GCP", name: "GCP Iowa", regionCode: "us-central-1", lat: 41.878, lng: -93.0977 },

    // ---------- Azure ----------
    { id: "azure-frankfurt", provider: "AZURE", name: "Azure Germany West Central", regionCode: "de-west-central", lat: 50.1109, lng: 8.6821 },
    { id: "azure-london", provider: "AZURE", name: "Azure UK South", regionCode: "uk-south", lat: 51.5072, lng: -0.1276 },
    { id: "azure-dublin", provider: "AZURE", name: "Azure Ireland", regionCode: "eu-west", lat: 53.3498, lng: -6.2603 },
    { id: "azure-south-korea", provider: "AZURE", name: "Azure Seoul", regionCode: "kr-south", lat: 37.5665, lng: 126.978 },
];
