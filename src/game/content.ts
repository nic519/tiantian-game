export type Chain = 'cake' | 'drink' | 'fruit';
export interface ItemDefinition { id: string; name: string; chain: Chain | 'producer'; level: number; next?: string; producer?: 'bakery' | 'cafe'; description: string }
export const COLS = 7;
export const ROWS = 9;
export const ENERGY_MAX = 100;
export const ENERGY_INTERVAL = 120_000;
export const STORAGE_SIZE = 8;
export const CONTENT_VERSION = 'local-restoration-1';
export const chainNames: Record<Chain, string> = { cake: '烘焙时光', drink: '香醇咖啡', fruit: '缤纷果语' };
const names: Record<Chain, string[]> = {
 cake: ['黄油饼干','香草纸杯蛋糕','草莓甜甜圈','巧克力切块','草莓慕斯','樱桃奶油蛋糕','梦幻庆典蛋糕'],
 drink: ['香醇浓缩','鲜奶拿铁','焦糖玛奇朵','奶油摩卡','草莓冰沙','蜜桃气泡饮','彩虹特调'],
 fruit: ['新鲜草莓','甜蜜双莓','蓝莓小碗','水果拼盘','莓果圣代','缤纷水果塔','花园下午茶']
};
export const ITEMS: Record<string, ItemDefinition> = Object.fromEntries(
 (Object.keys(names) as Chain[]).flatMap(chain => names[chain].map((name,i)=>[`${chain}-${i+1}`,{id:`${chain}-${i+1}`,name,chain,level:i+1,next:i<6?`${chain}-${i+2}`:undefined,description:i<6?'拖动两个相同的物品，合成更高一级的惊喜。':'这一系列的最高等级，可以用来完成特别订单。'}]))
);
ITEMS['producer-bakery']={id:'producer-bakery',name:'甜心烤箱',chain:'producer',level:1,producer:'bakery',description:'点击制作烘焙甜品，每次消耗 1 点体力。'};
ITEMS['producer-cafe']={id:'producer-cafe',name:'花园饮品机',chain:'producer',level:1,producer:'cafe',description:'点击制作咖啡或水果，每次消耗 1 点体力。'};
export interface Need { definition: string; count: number }
export const ORDER_TEMPLATES: Need[][] = [
 [{definition:'cake-1',count:1},{definition:'drink-1',count:1}],
 [{definition:'cake-2',count:1}], [{definition:'fruit-2',count:1}],
 ...Array.from({length:17},(_,i)=>[{definition:`${(['cake','drink','fruit'] as const)[i%3]}-${2+Math.floor(i/6)}`,count:1}])
];
export const CUSTOMERS = ['小满','安妮','阿岚','悠悠','小鹿','米娅'];
