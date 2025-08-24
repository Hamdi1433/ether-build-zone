
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mail, TrendingUp, Users, MousePointer, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BrevoIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [brevoStats, setBrevoStats] = useState({
    totalSent: 1247,
    totalOpened: 623,
    totalClicked: 156,
    totalBounced: 23,
    openRate: 49.9,
    clickRate: 12.5,
    bounceRate: 1.8
  });

  const mockCampaigns = [
    {
      id: 1,
      name: "Newsletter Janvier 2024",
      status: "sent",
      sent: 850,
      opened: 425,
      clicked: 89,
      date: "2024-01-15"
    },
    {
      id: 2,
      name: "Offre Spéciale Assurance Auto",
      status: "sent",
      sent: 397,
      opened: 198,
      clicked: 67,
      date: "2024-01-10"
    },
    {
      id: 3,
      name: "Relance Prospects",
      status: "draft",
      sent: 0,
      opened: 0,
      clicked: 0,
      date: "2024-01-20"
    }
  ];

  const weeklyData = [
    { day: 'Lun', envois: 120, ouvertures: 60, clics: 15 },
    { day: 'Mar', envois: 180, ouvertures: 90, clics: 22 },
    { day: 'Mer', envois: 150, ouvertures: 75, clics: 18 },
    { day: 'Jeu', envois: 200, ouvertures: 100, clics: 25 },
    { day: 'Ven', envois: 170, ouvertures: 85, clics: 20 },
    { day: 'Sam', envois: 80, ouvertures: 40, clics: 10 },
    { day: 'Dim', envois: 60, ouvertures: 30, clics: 8 }
  ];

  const handleConnect = () => {
    setIsConnected(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Intégration Brevo</h2>
          <p className="text-muted-foreground">Statistiques et gestion de vos campagnes email</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center space-x-1">
            {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            <span>{isConnected ? "Connecté" : "Non connecté"}</span>
          </Badge>
          {!isConnected && (
            <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Connecter Brevo
            </Button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
          <CardContent className="p-8 text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2">Connectez votre compte Brevo</h3>
            <p className="text-muted-foreground mb-4">
              Synchronisez vos campagnes email et accédez aux statistiques en temps réel
            </p>
            <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
              Configurer l'intégration Brevo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">Emails Envoyés</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">{brevoStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-blue-600">Total des envois</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-600">Taux d'Ouverture</p>
                </div>
                <p className="text-2xl font-bold text-green-900">{brevoStats.openRate}%</p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${brevoStats.openRate}%` }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <MousePointer className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-purple-600">Taux de Clic</p>
                </div>
                <p className="text-2xl font-bold text-purple-900">{brevoStats.clickRate}%</p>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${brevoStats.clickRate}%` }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-orange-600">Bounces</p>
                </div>
                <p className="text-2xl font-bold text-orange-900">{brevoStats.totalBounced}</p>
                <p className="text-xs text-orange-600">{brevoStats.bounceRate}% du total</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité de la Semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="envois" stroke="#3b82f6" strokeWidth={2} name="Envois" />
                    <Line type="monotone" dataKey="ouvertures" stroke="#10b981" strokeWidth={2} name="Ouvertures" />
                    <Line type="monotone" dataKey="clics" stroke="#f59e0b" strokeWidth={2} name="Clics" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dernières Campagnes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                          {campaign.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{campaign.sent}</div>
                          <div className="text-muted-foreground">Envoyés</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{campaign.opened}</div>
                          <div className="text-muted-foreground">Ouverts</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-600">{campaign.clicked}</div>
                          <div className="text-muted-foreground">Clics</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
