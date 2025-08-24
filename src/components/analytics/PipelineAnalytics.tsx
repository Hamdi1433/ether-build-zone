
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Projet, Contrat } from '../../lib/types';

interface PipelineAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function PipelineAnalytics({ projets, contrats }: PipelineAnalyticsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analyse du Pipeline</h2>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
