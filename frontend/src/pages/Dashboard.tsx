import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await statsAPI.getDashboard();
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bine ai venit! Iată o privire de ansamblu.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clienți</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalClients || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ședințe</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ședințe Plătite</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.paidSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">De Încasat</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.unpaidAmount || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Ședințele de Astăzi</CardTitle>
          <CardDescription>Programul zilei curente</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.todaySessions?.length > 0 ? (
            <div className="space-y-3">
              {data.todaySessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">{session.student_name}</p>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatTime(session.session_time)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      session.payment_status === 'Plătit' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {session.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nu ai ședințe programate astăzi</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Următoarele Ședințe</CardTitle>
          <CardDescription>Ședințele viitoare</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.upcomingSessions?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{session.student_name}</p>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDate(session.session_date)}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(session.session_time)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nu ai ședințe viitoare</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
