export type Category = "精密模型" | "游戏模型" | "精密机械化";

export type MotifKind =
  | "caliper"
  | "armor"
  | "blade"
  | "track"
  | "escapement"
  | "press"
  | "hull"
  | "linkage";

export type Work = {
  code: string;
  title: string;
  year: string;
  category: Category;
  client: string;
  summary: string;
  detail: string;
  specs: { label: string; value: string }[];
  deliverables: string[];
  motif: MotifKind;
};

export const categories: Array<Category | "全部"> = [
  "全部",
  "精密模型",
  "游戏模型",
  "精密机械化",
];

export const services: Array<{
  index: string;
  title: string;
  en: string;
  body: string;
  points: string[];
}> = [
  {
    index: "01",
    title: "精密模型",
    en: "PRECISION",
    body: "展览、教学和发布会用的实体感模型。几何按尺寸表来，剖视、爆炸和可拆装都先保证还能装回去。",
    points: ["1:1 与放大比例", "剖视与爆炸步骤", "打印母模和工程图", "展陈分件与装配顺序"],
  },
  {
    index: "02",
    title: "游戏模型",
    en: "HARD-SURFACE",
    body: "机甲、载具、武器和场景模块。高模留出真实间隙，低模、LOD 和碰撞体按 Unity 或 Unreal 的交付习惯分开。",
    points: ["高模 / 低模 / LOD", "硬表面分件与枢轴", "PBR 与贴图集", "FBX、glTF 引擎交付"],
  },
  {
    index: "03",
    title: "精密机械化",
    en: "MECHANISM",
    body: "齿轮、齿条、液压、擒纵和关节。先验证行程、传动比和干涉，再做外观。机构要能转，而不是摆一个看起来会动的姿势。",
    points: ["传动与死点检查", "可动约束与限位", "装配动画", "配合间隙标注"],
  },
];

export const works: Work[] = [
  {
    code: "VN-014",
    title: "甲胄-07",
    year: "2025",
    category: "游戏模型",
    client: "独立游戏组",
    summary: "42 处可动关节的重装机甲。装甲板只绕销轴转，近景不穿插。",
    detail:
      "高模按铰链留间隙，蒙皮权重绑在销轴上，装甲不跟着大臂一起拉扯。低模和碰撞体分开交，肩部和膝部保留可替换模块，方便游戏里换装甲。",
    specs: [
      { label: "面数", value: "86k / 18k / 4k" },
      { label: "关节", value: "42 处" },
      { label: "贴图", value: "4K PBR × 6" },
      { label: "引擎", value: "Unreal" },
    ],
    deliverables: ["高模", "游戏低模", "LOD", "骨骼", "PBR"],
    motif: "armor",
  },
  {
    code: "VN-009",
    title: "一号游标",
    year: "2024",
    category: "精密模型",
    client: "职业教学",
    summary: "1:1 可拆装游标卡尺。主尺、游标、测深杆和锁紧螺钉全部独立成件。",
    detail:
      "给学生和展台用的教学卡尺。刻线按 0.02 mm 读数逻辑排列，零件可以按装配顺序拆开。文件里附尺寸表，打印公差另行标注，不和数字模型混在一起。",
    specs: [
      { label: "零件", value: "28" },
      { label: "比例", value: "1:1" },
      { label: "读数", value: "0.02 mm" },
      { label: "打印建议", value: "±0.10 mm" },
    ],
    deliverables: ["分件", "装配顺序", "尺寸表", "STL"],
    motif: "caliper",
  },
  {
    code: "VN-021",
    title: "叶片剖视",
    year: "2025",
    category: "精密模型",
    client: "航空展陈",
    summary: "放大三倍的涡轮叶片。冷却通道被切开，气膜孔和榫头还能对上。",
    detail:
      "按公开教材里的叶型关系重建，不是扫描翻模。三处剖切分别看壁厚、内部通道和榫头。爆炸图六步，合上之后外表面仍然连续。",
    specs: [
      { label: "比例", value: "3:1" },
      { label: "剖切", value: "3 处" },
      { label: "爆炸", value: "6 步" },
      { label: "用途", value: "展陈" },
    ],
    deliverables: ["剖视模型", "爆炸图", "展陈分件"],
    motif: "blade",
  },
  {
    code: "VN-018",
    title: "赤潮",
    year: "2023",
    category: "游戏模型",
    client: "独立游戏组",
    summary: "履带步兵战车。负重轮、诱导轮和液压臂可动，履带是可替换模块。",
    detail:
      "履带不靠一张长贴图硬弯。每块履带板独立，车体侧面的工具和管线按硬表面分件，方便做破损替换。液压臂的行程在文件里锁了上下限。",
    specs: [
      { label: "模块", value: "14" },
      { label: "贴图集", value: "2 × 4K" },
      { label: "引擎", value: "Unity" },
      { label: "可动", value: "履带 / 液压臂" },
    ],
    deliverables: ["模块化车体", "履带板", "贴图集", "FBX"],
    motif: "track",
  },
  {
    code: "VN-006",
    title: "擒纵",
    year: "2022",
    category: "精密机械化",
    client: "钟表教学",
    summary: "放大八倍的擒纵机构。卡瓦进出和轮齿冲击点按节拍对齐。",
    detail:
      "用来讲清一座钟为什么会嘀嗒。轮齿、卡瓦、摆轮分开建，冲击点留在可见的位置。装配动画一个节拍 1.2 秒，可以停在接触的那一帧。",
    specs: [
      { label: "比例", value: "8:1" },
      { label: "节拍", value: "1.2 s" },
      { label: "零件", value: "19" },
      { label: "动画", value: "可逐帧" },
    ],
    deliverables: ["机构分件", "装配动画", "接触帧"],
    motif: "escapement",
  },
  {
    code: "VN-027",
    title: "节拍压机",
    year: "2024",
    category: "精密机械化",
    client: "职业教学",
    summary: "曲柄滑块教学台。行程、偏置和死点可以改尺寸，连杆不脱离销轴。",
    detail:
      "把曲柄半径和连杆长度做成可调的基准。滑块沿导轨走，两个死点不会把连杆顶出销孔。用于机构课，也作为精密机械化项目的起点文件。",
    specs: [
      { label: "行程", value: "48 mm" },
      { label: "曲柄", value: "半径 24 mm" },
      { label: "动画", value: "12 s" },
      { label: "死点", value: "2 处已锁" },
    ],
    deliverables: ["可调机构", "导轨", "动画"],
    motif: "press",
  },
  {
    code: "VN-011",
    title: "深潜舱",
    year: "2025",
    category: "游戏模型",
    client: "独立游戏组",
    summary: "可拆成走廊、舱门、仪表和外骨骼的场景模块。门轴和管线卡箍单独分件。",
    detail:
      "舱段之间用统一的接口环拼接。门、锁销、仪表和管线都可以单独替换。碰撞体按走廊和门洞分开，不和装饰管线缠在一起。",
    specs: [
      { label: "模块", value: "22" },
      { label: "碰撞", value: "已分" },
      { label: "接口", value: "统一环" },
      { label: "格式", value: "glTF + FBX" },
    ],
    deliverables: ["场景模块", "碰撞体", "glTF", "FBX"],
    motif: "hull",
  },
  {
    code: "VN-023",
    title: "膝铰",
    year: "2023",
    category: "精密机械化",
    client: "发布会展示",
    summary: "膝关节展示机构，屈曲 0–120°。限位和锁止在模型上看得见。",
    detail:
      "给发布会和讲解用的放大机构，不是医疗器械设计。屈曲角度被限位块卡住，锁止销在伸直位插入。外壳可以拿掉，里面的铰链仍然完整。",
    specs: [
      { label: "屈曲", value: "0–120°" },
      { label: "零件", value: "11" },
      { label: "比例", value: "2:1" },
      { label: "用途", value: "展示机构" },
    ],
    deliverables: ["可动铰链", "限位", "可拆外壳"],
    motif: "linkage",
  },
];

export const steps = [
  {
    index: "01",
    title: "公差访谈",
    time: "2–3 天",
    body: "先问用途。上展台、进引擎，还是拿来讲机构，间隙不是同一个数。",
  },
  {
    index: "02",
    title: "基准建模",
    time: "1 周",
    body: "先放基准面、孔轴和关键尺寸。倒角和磨损留到结构成立之后。",
  },
  {
    index: "03",
    title: "机构验证",
    time: "3–6 天",
    body: "转一圈看干涉、行程和死点。对不齐的孔在这一步改，不留到贴图。",
  },
  {
    index: "04",
    title: "表面",
    time: "1–2 周",
    body: "分件、倒角、刻线和磨损按装配顺序来。先装上的零件，磨损在接触面上。",
  },
  {
    index: "05",
    title: "交付",
    time: "2–4 天",
    body: "FBX、glTF 或 USD，加上工程图、打印文件和一张装配顺序。",
  },
  {
    index: "06",
    title: "装调",
    time: "一版",
    body: "按实机或实拍回一版几何。第二版只动对不上的地方。",
  },
];

export const ticker = [
  "精密模型",
  "游戏硬表面",
  "可动机构",
  "剖视与爆炸图",
  "打印母模",
  "Unity / Unreal",
  "齿轮 · 齿条 · 液压",
  "公差与干涉",
  "glTF / FBX / USD",
  "装配动画",
];
