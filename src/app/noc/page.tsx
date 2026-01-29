
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function NocPage() {
  const { toast } = useToast();
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState<{
    num1: number;
    num2: number;
    answer: number;
  } | null>(null);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, answer: n1 + n2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captcha || parseInt(captchaAnswer, 10) !== captcha.answer) {
      toast({
        variant: 'destructive',
        title: 'Invalid Captcha',
        description: 'Please solve the math problem correctly.',
      });
      generateCaptcha();
      setCaptchaAnswer('');
    } else {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6 font-body">
        <div>
          <h2 className="font-headline text-2xl font-bold text-primary">One account is all you need</h2>
        </div>
        <div className="space-y-2">
            <p><Link href="#" className="text-primary hover:underline">Don't have an account! Sign Up Here</Link></p>
            <p><Link href="#" className="text-primary hover:underline">Forgot Password..!</Link></p>
        </div>
        <div className="space-y-2">
            <h3 className="font-headline font-bold text-lg">Office No.(For Enquiry)</h3>
            <p>022-22620360(Time 10 am to 4 pm)</p>
        </div>
        <div className="space-y-2">
            <h3 className="font-headline font-bold text-lg">Technical Support (Only for Technical issues)</h3>
            <p>7738842749(Time 11 am to 4 pm)</p>
            <p>mpconlineservice@gmail.com</p>
        </div>
        <div>
        <Link href="#" className="text-primary hover:underline">User Manual For Online Application Submission</Link>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="border rounded-lg p-6 bg-card shadow-sm">
            <h2 className="font-headline text-2xl font-bold text-primary mb-6 flex items-center gap-2"><Lock size={24} /> Login Now</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">User Name</Label>
                <Input id="username" placeholder="Enter Email ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="captcha">How much is the sum</Label>
                <div className="flex items-center gap-2">
                    <span className="p-2 bg-muted rounded-md">{captcha ? `${captcha.num1} + ${captcha.num2} = ?` : '...'}</span>
                    <Input
                    id="captcha"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Your answer"
                    required
                    disabled={!captcha}
                    className="w-32"
                    />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-white"
              >
                Login
              </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
