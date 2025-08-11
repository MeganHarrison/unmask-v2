import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MilestoneTable from "@/components/tables/MilestoneTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Relationship Trajectory | Unmask",
  description:
    "Raw, brutally honest guidance to transform your relationship.",
  // other metadata
};

export default function TrajectoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Milestone Table" />
      <div className="space-y-6">
          <MilestoneTable />
      </div>
    </div>
  );
}
