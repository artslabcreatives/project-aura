import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';

interface DateRangePickerProps {
	onRangeChange: (startDate: string, endDate: string) => void;
	defaultDays?: number;
}

export function DateRangePicker({ onRangeChange, defaultDays = 30 }: DateRangePickerProps) {
	const [startDate, setStartDate] = useState(
		format(new Date(Date.now() - defaultDays * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
	);
	const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

	const handleApply = () => {
		onRangeChange(startDate, endDate);
	};

	const handlePreset = (days: number) => {
		const end = format(new Date(), 'yyyy-MM-dd');
		const start = format(new Date(Date.now() - days * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
		setStartDate(start);
		setEndDate(end);
		onRangeChange(start, end);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm">
					<Calendar className="h-4 w-4 mr-2" />
					{format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="space-y-4">
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Select Date Range</h4>
						<div className="grid gap-4">
							<div className="space-y-2">
								<Label htmlFor="start-date">Start Date</Label>
								<Input
									id="start-date"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end-date">End Date</Label>
								<Input
									id="end-date"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label className="text-xs text-muted-foreground">Quick Select</Label>
						<div className="grid grid-cols-3 gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePreset(7)}
								className="text-xs"
							>
								7 days
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePreset(30)}
								className="text-xs"
							>
								30 days
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePreset(90)}
								className="text-xs"
							>
								90 days
							</Button>
						</div>
					</div>

					<Button onClick={handleApply} className="w-full">
						Apply Range
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
