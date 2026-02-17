import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Upload, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import waveQrCode from '@/assets/wave-qr-code.png';

interface WavePaymentProps {
    amount: number;
    memberId: string;
    seasonId: string;
    paymentType: string;
    monthNumber?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function WavePayment({
    amount,
    memberId,
    seasonId,
    paymentType,
    monthNumber,
    onSuccess,
    onCancel,
}: WavePaymentProps) {
    const [step, setStep] = useState(1); // 1: QR Code, 2: Upload Proof
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleConfirmScan = () => {
        setStep(2);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            toast({
                title: 'Erreur',
                description: 'Veuillez téléverser une preuve de paiement',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload the file
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost/vovinam/api'}/upload.php`, {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

            // 2. Record the payment as PENDING
            await api.post('/payments.php', {
                member_id: memberId,
                season_id: seasonId,
                amount,
                payment_type: paymentType,
                payment_method: 'wave',
                payment_date: new Date().toISOString().split('T')[0],
                month_number: monthNumber ? Number(monthNumber) : null,
                proof_url: uploadData.url,
                status: 'PENDING',
                notes: 'Paiement Wave en attente de validation',
            });

            toast({
                title: 'Succès',
                description: 'Paiement enregistré et en attente de validation',
            });
            onSuccess();
        } catch (error) {
            console.error('Error recording payment:', error);
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de l\'enregistrement',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm mx-auto border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-center text-navy flex items-center justify-center gap-2">
                    {step === 1 ? 'Paiement Wave' : 'Preuve de paiement'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {step === 1 ? (
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Montant à régler</p>
                            <p className="text-3xl font-display font-bold text-red-martial">
                                {amount.toLocaleString()} FCFA
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <div className="p-2 bg-white rounded-lg">
                                <img
                                    src={waveQrCode}
                                    alt="Wave QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-navy">
                                Compte : <span className="font-bold">Daouda fickou</span>
                            </p>
                            <p className="text-sm font-medium text-navy">
                                Numéro : <span className="font-bold">75 557 55 51</span>
                            </p>
                            <p className="text-xs text-muted-foreground italic">
                                Scannez le QR Code ci-dessus ou envoyez directement au numéro indiqué.
                            </p>
                        </div>

                        <Button
                            onClick={handleConfirmScan}
                            className="w-full bg-navy hover:bg-navy-light text-white"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            J'ai effectué le paiement
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="text-sm text-muted-foreground">
                                Merci d'envoyer une capture d'écran du message de confirmation Wave.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proof">Capture d'écran (Preuve)</Label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                <Input
                                    id="proof"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-xs text-center text-muted-foreground">
                                    {file ? file.name : "Cliquez ou glissez votre image ici"}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="flex-1"
                                disabled={isUploading}
                            >
                                Retour
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="flex-[2] bg-red-martial hover:bg-red-martial-light text-white"
                                disabled={!file || isUploading}
                            >
                                {isUploading ? "Envoi..." : "Envoyer la preuve"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground" disabled={isUploading}>
                    Annuler
                </Button>
            </CardFooter>
        </Card>
    );
}
