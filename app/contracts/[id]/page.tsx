import ContractEditor from "../contract-editor";
export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractEditor contractId={id} />;
}
