import type { AssetPath } from '$app/types';

export type Recipe = {
	slug: string;
	title: string;
	image?: AssetPath;
	ingredients: string[];
	steps: string[];
};

export const recipes: Recipe[] = [
	{
		slug: 'proteinsmoothie',
		title: 'Proteinsmoothie',
		image: 'images/proteinsmoothie.jpg',
		ingredients: [
			'1 banan, gjerne med litt brune flekker',
			'150 g gresk yoghurt',
			'150 g frosne jordbær',
			'50 g frosne blåbær'
		],
		steps: ['Kjør alt sammen i en blender til det er glatt']
	},
	{
		slug: 'laksepasta',
		title: 'Laksepasta',
		image: 'images/laksepasta.jpg',
		ingredients: [
			'1/2 stor rødløk, eller én liten',
			'87.5 g frosne erter (1/4 pose)',
			'Soltørkede tomater / 1 ss paste',
			'100-150 g creme fraiche lett',
			'Ca. 125 g laks',
			'50 g pasta'
		],
		steps: [
			'Sett på pasta for koking',
			'Stek laks, erter og rødløk',
			'Hiv i soltørkede tomater',
			'Hiv i creme fraiche',
			'Hiv i pasta når den er ferdig',
			'Krydre med salt, pepper, chiliflak'
		]
	}
];
