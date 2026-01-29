'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, RotateCcw } from 'lucide-react';

export default function ApplicationStatusPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl shadow-sm font-ui">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-center font-bold text-primary border-b-2 border-primary/20 pb-2">
            Technical Support Master
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="search-by" className="font-medium">
                Search By
              </label>
              <Select>
                <SelectTrigger id="search-by" className="w-[180px]">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application-id">Application ID</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input type="text" className="w-full sm:w-auto flex-grow" />
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" /> Show
            </Button>
            <Button variant="destructive">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
