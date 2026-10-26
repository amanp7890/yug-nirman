import React from "react";
import { AlertTriangle } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import CityDiagnosis from "../components/dashboard/CityDiagnosis";

export default function CityProblems() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="City Issues & Fixes"
        subtitle="Identify key city indicators that need attention and practical ways to solve them."
        icon={AlertTriangle}
        whyFeatureIds={["traffic-intelligence", "pollution-detection", "infrastructure-risk"]}
      />
      <CityDiagnosis />
    </div>
  );
}
