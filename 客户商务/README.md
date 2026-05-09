# 客户与商务材料

本目录存放面向客户的商务与报价材料，与仓库内产品设计文档对齐。

## 文件说明

| 文件 | 说明 |
|------|------|
| `产品建设方案总册.md` | 目标态 M01–M10 应用模块、三端矩阵、分期与报价单一级模块对照；权威业务规则仍见 `docs/01`、`04`、`08`。 |
| `附录_模块与文档映射表.md` | 模块与设计文档、原型入口对照。 |
| `产品建设方案总册.docx`、`附录_模块与文档映射表.docx` | 由同名 `.md` 转换的 Word 版（见下方脚本）；Mermaid 图需在 `.md` 中查看。 |
| `碳足迹系统_模块化报价单.xlsx` | **单工作表**，列结构与招采《拆分工作量评估与报价清单》对齐：**子模块 / 一级功能 / 二级功能 / 预估工作量(人天) / 单价 / 预估报价**；子模块与一级功能列纵向合并；**统一 1500 元/人天**；SpreadJS 固定价 **101000** 元；总价 **80 万**。 |
| `碳足迹系统_工作量范围评估说明.docx` | Word 章节骨架对齐招采《研发工作量评估说明》（1 概述、2 范围与边界、3 工作量评估、4 里程碑）；第 4 节摘录 `reference_formats/碳足迹-排期说明.docx`。 |
| `docs/报价版式规格.md` | 招采参考 Excel 解析要点与碳足迹对齐约定。 |
| `reference_formats/` | 招采与排期参考文件副本及说明；见该目录 `README.md`。 |
| `scripts/build_quotation_xlsx.py` | 从结构化数据生成上述 xlsx；修改明细行后运行以重新生成。 |
| `scripts/build_scope_assessment_docx.py` | 生成《工作量范围评估说明》docx（依赖 `build_quotation_xlsx` 数据 + 排期说明）。 |
| `scripts/md_to_docx.py` | 将总册与附录 Markdown 转为 DOCX。 |

## 重新生成报价表

在仓库根目录执行（需已创建虚拟环境并安装 openpyxl，见根目录 `.venv_quotation/`）：

```bash
.venv_quotation/bin/python 客户商务/scripts/build_quotation_xlsx.py
```

## 重新生成《工作量范围评估说明》Word

需已安装 **openpyxl** 与 **python-docx**（可与报价表共用 `.venv_quotation`），且 `reference_formats/碳足迹-排期说明.docx` 存在：

```bash
.venv_quotation/bin/pip install openpyxl python-docx
.venv_quotation/bin/python 客户商务/scripts/build_scope_assessment_docx.py
```

## 将建设方案 Markdown 转为 Word（DOCX）

```bash
python3 -m venv .venv_docx
.venv_docx/bin/pip install markdown html2docx beautifulsoup4 lxml
.venv_docx/bin/python 客户商务/scripts/md_to_docx.py
```

可指定文件：`.venv_docx/bin/python 客户商务/scripts/md_to_docx.py 客户商务/产品建设方案总册.md`

首次若无虚拟环境：

```bash
python3 -m venv .venv_quotation
.venv_quotation/bin/pip install openpyxl python-docx
.venv_quotation/bin/python 客户商务/scripts/build_quotation_xlsx.py
.venv_quotation/bin/python 客户商务/scripts/build_scope_assessment_docx.py
```

## 明细行依据

- 模块全景与 M01–M10：`产品建设方案总册.md`、`附录_模块与文档映射表.md`
- 供应商端：`docs/02_功能与对接/06_供应商工作台功能清单与信息结构.md`
- 核查机构端：`docs/02_功能与对接/09_核查机构端功能清单与入口说明.md`
- 运营端与阶段边界：`docs/00_迭代计划/第一阶段设计方案.md`
- 横向能力（模板、澄清、集成、TDS）：`docs/02`、`docs/04`、`docs/05`、`docs/02/11_接口与互操作设计（实施期）.md`

人天与金额由 [`scripts/build_quotation_xlsx.py`](scripts/build_quotation_xlsx.py) 按 **1500 元/人天** 与脚本内人天池（MVP 333 + 二阶段/可选 133 = 466 人天）及 SpreadJS 固定费自动编排；总价 **80 万**（699000 + 101000）。重算请改脚本内常量后重新运行。勿手改「金额」列公式。
