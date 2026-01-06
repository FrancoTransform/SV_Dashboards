import { FundPage } from "@/components/fund-page";
import fundIIIData from "@/data/fund_iii_data.json";
import { FundData } from "@/types";

export default function FundIIIPage() {
    const data = fundIIIData as unknown as FundData;

    return <FundPage fundData={data} fundName="SemperVirens Fund III" fundId="fund-iii" />;
}
