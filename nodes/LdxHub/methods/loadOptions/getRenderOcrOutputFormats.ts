import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type Conversion = {
	from: string;
	to: string;
};

type Engine = {
	id: string;
	supported_conversions?: Conversion[];
};

type EnginesResponse = {
	data?: Engine[];
};

export async function getRenderOcrOutputFormats(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const engineId = this.getCurrentNodeParameter('engine') as string | undefined;
	if (!engineId) {
		return [];
	}

	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/renderocr/engines',
	)) as EnginesResponse;

	const engine = response.data?.find((e) => e.id === engineId);
	const conversions = engine?.supported_conversions ?? [];

	const formats = Array.from(new Set(conversions.map((c) => c.to))).sort();

	return formats.map((f) => ({
		name: f.toUpperCase(),
		value: f,
	}));
}
