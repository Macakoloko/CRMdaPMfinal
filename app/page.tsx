"use client"

import Dashboard from "./protected_area/page"
import { PageLayout } from "@/components/page-layout"
import { TutorialButton } from "@/components/tutorial-button"

export default function Home() {
  return (
    <PageLayout>
      <Dashboard />
      <TutorialButton />
    </PageLayout>
  )
}

