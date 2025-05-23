"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { collection, getDocs, query, where, orderBy, DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "../services/firebase"

interface ServiceCount {
  name: string
  value: number
}

const COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#eab308", "#ef4444"]

// Mock data for fallback
const mockServicesData: ServiceCount[] = [
  { name: "Corte de Cabelo", value: 35 },
  { name: "Coloração", value: 25 },
  { name: "Manicure", value: 20 },
  { name: "Pedicure", value: 15 },
  { name: "Tratamentos", value: 5 },
];

export function PopularServices() {
  const [servicesData, setServicesData] = useState<ServiceCount[]>(mockServicesData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        setIsLoading(true)

        // Use mock data for now
        setServicesData(mockServicesData);
        
        /*
        // Uncomment this when Firebase is properly set up
        // Get all appointments/services
        const q = query(
          collection(db, "agendamentos")
        )
        
        const querySnapshot = await getDocs(q)
        const servicesMap = new Map<string, number>()
        
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data()
          if (data.servico) {
            // Count service occurrences
            const serviceName = data.servico
            if (servicesMap.has(serviceName)) {
              servicesMap.set(serviceName, servicesMap.get(serviceName)! + 1)
            } else {
              servicesMap.set(serviceName, 1)
            }
          }
        })
        
        // Convert to array and sort by popularity
        let serviceEntries = Array.from(servicesMap.entries())
          .map(([name, count]) => ({ name, value: count }))
          .sort((a, b) => b.value - a.value)
        
        // Get top 5 services
        serviceEntries = serviceEntries.slice(0, 5)
        
        // Calculate percentages
        const total = serviceEntries.reduce((sum, entry) => sum + entry.value, 0)
        serviceEntries = serviceEntries.map(entry => ({
          name: entry.name,
          value: Math.round((entry.value / total) * 100)
        }))
        
        setServicesData(serviceEntries)
        */
      } catch (error) {
        console.error("Error fetching popular services:", error)
        // Always use mock data as fallback
        setServicesData(mockServicesData)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPopularServices()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-[300px]">Carregando dados...</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={servicesData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {servicesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, "Porcentagem"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

