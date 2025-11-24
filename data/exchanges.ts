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
    // Binance
    { id: "binance-tokyo", name: "Binance", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, provider: "AWS", regionCode: "ap-northeast-1" },
    { id: "binance-virginia", name: "Binance", city: "Ashburn", country: "USA", lat: 39.0438, lng: -77.4874, provider: "AWS", regionCode: "us-east-1" },

    // OKX
    { id: "okx-singapore", name: "OKX", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, provider: "GCP", regionCode: "asia-southeast1" },

    // Deribit
    { id: "deribit-amsterdam", name: "Deribit", city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, provider: "AWS", regionCode: "eu-west-1" },

    // Bybit
    { id: "bybit-frankfurt", name: "Bybit", city: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821, provider: "AZURE", regionCode: "eu-central" },

    // Coinbase
    { id: "coinbase-virginia", name: "Coinbase", city: "Ashburn", country: "USA", lat: 39.0438, lng: -77.4874, provider: "AWS", regionCode: "us-east-1" },
    { id: "coinbase-london", name: "Coinbase", city: "London", country: "UK", lat: 51.5072, lng: -0.1276, provider: "AZURE", regionCode: "uk-south" },

    // Kraken
    { id: "kraken-dublin", name: "Kraken", city: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603, provider: "AZURE", regionCode: "eu-west" },
    { id: "kraken-seattle", name: "Kraken", city: "Seattle", country: "USA", lat: 47.6062, lng: -122.3321, provider: "AWS", regionCode: "us-west-2" },

    // Bitget
    { id: "bitget-singapore", name: "Bitget", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, provider: "GCP", regionCode: "asia-southeast1" },

    // KuCoin
    { id: "kucoin-hongkong", name: "KuCoin", city: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694, provider: "AWS", regionCode: "ap-east-1" },

    // Huobi
    { id: "huobi-seoul", name: "Huobi", city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978, provider: "AZURE", regionCode: "kr-south" },
];
