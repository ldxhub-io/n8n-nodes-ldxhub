import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getCastDocEngines } from './methods/loadOptions/getCastDocEngines';
import { getCastDocOutputFormats } from './methods/loadOptions/getCastDocOutputFormats';
import { getExtractDocEngines } from './methods/loadOptions/getExtractDocEngines';
import { getExtractDocOutputFormats } from './methods/loadOptions/getExtractDocOutputFormats';
import { getModels } from './methods/loadOptions/getModels';
import { getRenderOcrEngines } from './methods/loadOptions/getRenderOcrEngines';
import { getRenderOcrLanguages } from './methods/loadOptions/getRenderOcrLanguages';
import { getRenderOcrOutputFormats } from './methods/loadOptions/getRenderOcrOutputFormats';
import { getStructFlowModels } from './methods/loadOptions/getStructFlowModels';
import { castDocDescription } from './resources/castDoc';
import { runJobExecute as castDocRunJobExecute } from './resources/castDoc/runJob.execute';
import { extractDocDescription } from './resources/extractDoc';
import { runJobExecute as extractDocRunJobExecute } from './resources/extractDoc/runJob.execute';
import { refineLoopDescription } from './resources/refineLoop';
import { runJobExecute as refineLoopRunJobExecute } from './resources/refineLoop/runJob.execute';
import { renderOcrDescription } from './resources/renderOcr';
import { runJobExecute as renderOcrRunJobExecute } from './resources/renderOcr/runJob.execute';
import { structFlowDescription } from './resources/structFlow';
import { runJobExecute as structFlowRunJobExecute } from './resources/structFlow/runJob.execute';

export class LdxHub implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LDXhub',
		name: 'ldxHub',
		icon: 'file:ldxhub.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Work with the LDXhub AI-powered document processing platform',
		defaults: {
			name: 'LDXhub',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'ldxHubApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
			{
				name: 'ldxHubDynamicApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKeyDynamic'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
					{
						name: 'API Key (Dynamic)',
						value: 'apiKeyDynamic',
					},
				],
				default: 'apiKey',
				description: 'How to authenticate. Use "Dynamic" for per-execution API keys via expressions (e.g., form input).',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'CastDoc',
						value: 'castDoc',
					},
					{
						name: 'ExtractDoc',
						value: 'extractDoc',
					},
					{
						name: 'RefineLoop',
						value: 'refineLoop',
					},
					{
						name: 'RenderOCR',
						value: 'renderOcr',
					},
					{
						name: 'StructFlow',
						value: 'structFlow',
					},
				],
				default: 'refineLoop',
			},
			...castDocDescription,
			...extractDocDescription,
			...refineLoopDescription,
			...renderOcrDescription,
			...structFlowDescription,
		],
	};

	methods = {
		loadOptions: {
			getCastDocEngines,
			getCastDocOutputFormats,
			getExtractDocEngines,
			getExtractDocOutputFormats,
			getModels,
			getRenderOcrEngines,
			getRenderOcrLanguages,
			getRenderOcrOutputFormats,
			getStructFlowModels,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (resource === 'castDoc' && operation === 'runJob') {
			return castDocRunJobExecute.call(this, items);
		}
		if (resource === 'extractDoc' && operation === 'runJob') {
			return extractDocRunJobExecute.call(this, items);
		}
		if (resource === 'refineLoop' && operation === 'runJob') {
			return refineLoopRunJobExecute.call(this, items);
		}
		if (resource === 'renderOcr' && operation === 'runJob') {
			return renderOcrRunJobExecute.call(this, items);
		}
		if (resource === 'structFlow' && operation === 'runJob') {
			return structFlowRunJobExecute.call(this, items);
		}

		throw new NodeOperationError(
			this.getNode(),
			`Operation "${resource}.${operation}" is not supported`,
		);
	}
}
