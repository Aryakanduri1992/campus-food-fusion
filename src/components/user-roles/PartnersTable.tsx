
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { DeliveryPartner } from './types';

interface PartnersTableProps {
  partners: DeliveryPartner[];
  loading: boolean;
}

const PartnersTable: React.FC<PartnersTableProps> = ({ partners, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-rv-burgundy" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Assigned On</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partners.length > 0 ? (
          partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell>{partner.partner_name || "Not provided"}</TableCell>
              <TableCell>{partner.phone_number || "Not provided"}</TableCell>
              <TableCell>{partner.email}</TableCell>
              <TableCell>{new Date(partner.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-gray-500">
              No delivery partners assigned yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PartnersTable;
