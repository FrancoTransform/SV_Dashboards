import { FundPage } from "@/components/fund-page";
import fundData from "@/data/fund_data.json";
import { FundData } from "@/types";

// Force static generation with the JSON data
export default function Home() {
    const data = fundData as unknown as FundData;

    return <FundPage fundData={data} fundName="SemperVirens Fund I" fundId="fund-i" />;
}
