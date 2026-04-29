import type { INodeProperties } from 'n8n-workflow';

import { runJobFields } from './runJob';

const showOnlyForExtractDoc = {
	resource: ['extractDoc'],
};

export const extractDocDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForExtractDoc,
		},
		options: [
			{
				name: 'Run Conversion Job',
				value: 'runJob',
				action: 'Run a conversion job',
				description:
					'Extract plain text or JSONL from PDF, DOCX, XLSX, or PPTX (no AI, no OCR)',
			},
		],
		default: 'runJob',
	},
	...runJobFields,
];
