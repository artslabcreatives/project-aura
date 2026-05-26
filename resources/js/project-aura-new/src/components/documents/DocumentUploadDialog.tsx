import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { uploadManager } from '@/lib/upload-manager';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/hooks/use-user';
import { Loader2, UploadCloud } from 'lucide-react';

interface Department {
    id: number;
    name: string;
}

interface DocumentUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DocumentUploadDialog({
    open,
    onOpenChange,
    onSuccess,
}: DocumentUploadDialogProps) {
    const [name, setName] = useState('');
    const [departmentId, setDepartmentId] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { currentUser } = useUser();

    const isRestricted = ['user', 'account-manager'].includes(currentUser?.role || '');

    useEffect(() => {
        if (open && currentUser) {
            fetchDepartments();
            if (isRestricted && currentUser.department) {
                setDepartmentId(String(currentUser.department));
            }
        }
    }, [open, isRestricted, currentUser]);

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get<Department[]>('/departments');
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!name) {
                // Auto-fill name with filename without extension
                setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleUpload = async () => {
        if (!name || !departmentId || !file) {
            toast({
                title: 'Missing information',
                description: 'Please fill in all fields and select a file.',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            await uploadManager.uploadDocument({
                name,
                departmentId: parseInt(departmentId),
                file,
            });

            toast({
                title: 'Upload started',
                description: 'Your document is being uploaded in the background.',
            });
            
            onSuccess();
            onOpenChange(false);
            // Reset form
            setName('');
            setDepartmentId('');
            setFile(null);
        } catch (error) {
            toast({
                title: 'Upload failed',
                description: error instanceof Error ? error.message : 'An error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="doc-name">Document Name</Label>
                        <Input
                            id="doc-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter document name"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doc-dept">Department</Label>
                        <Select 
                            value={departmentId} 
                            onValueChange={setDepartmentId}
                            disabled={isRestricted && !!departmentId}
                        >
                            <SelectTrigger id="doc-dept">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="doc-file">File</Label>
                        <div 
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => document.getElementById('doc-file')?.click()}
                        >
                            <UploadCloud className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {file ? file.name : 'Click to select or drag and drop'}
                            </span>
                            <Input
                                id="doc-file"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
