import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type Conversion = {
	from: string;
	to: string;
};

type Model = {
	id: string;
	supported_conversions?: Conversion[];
};

type ModelsResponse = {
	data?: Model[];
};

export async function getAnalyzeDocOutputFormats(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const modelId = this.getCurrentNodeParameter('model') as string | undefined;
	if (!modelId) {
		return [];
	}

	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/analyzedoc/models',
	)) as ModelsResponse;

	const model = response.data?.find((m) => m.id === modelId);
	const conversions = model?.supported_conversions ?? [];

	const formats = Array.from(new Set(conversions.map((c) => c.to))).sort();

	return formats.map((f) => ({
		name: f.toUpperCase(),
		value: f,
	}));
}
