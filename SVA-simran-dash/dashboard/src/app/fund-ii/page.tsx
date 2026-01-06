import { FundPage } from "@/components/fund-page";
import fundIIData from "@/data/fund_ii_data.json";
import { FundData } from "@/types";

export default function FundIIPage() {
    const data = fundIIData as unknown as FundData;

    return <FundPage fundData={data} fundName="SemperVirens Fund II" fundId="fund-ii" />;
}
