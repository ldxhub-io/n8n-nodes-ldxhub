import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ldxHubApiRequest } from '../../shared/transport';

type Engine = {
	id: string;
	provider?: string;
	display_name?: string;
	description?: string;
	supported_conversions?: unknown;
	supported_languages?: unknown;
};

type EnginesResponse = {
	data?: Engine[];
};

export async function getRenderOcrEngines(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = (await ldxHubApiRequest.call(
		this,
		'GET',
		'/renderocr/engines',
	)) as EnginesResponse;

	const engines = response.data ?? [];

	return engines.map((e) => ({
		name: e.display_name ?? e.id,
		value: e.id,
		description: e.description,
	}));
}
