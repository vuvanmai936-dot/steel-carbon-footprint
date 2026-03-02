/**
 * SpreadJS 公共工具 - 模板与填报表（采集表）统一方案
 * 依赖：GC (SpreadJS) 已全局加载
 */
(function (global) {
    'use strict';

    if (typeof GC === 'undefined') {
        console.error('spreadUtils: SpreadJS (GC) 未加载，请先引入 gc.spread.sheets.all');
        return;
    }

    const SpreadNS = GC.Spread.Sheets;

    /**
     * 根据 Snapshot 创建 Spread 实例
     * @param {HTMLElement} hostEl - 挂载容器
     * @param {Object} snapshot - { version, templateId?, sheetData: { SheetName: [[...]], ... }, evidenceRequirements? }
     * @param {Object} options - { editableCols?: number[], readOnly?: boolean, onValueChanged?: function }
     * @returns {GC.Spread.Sheets.Workbook}
     */
    function createSpreadFromSnapshot(hostEl, snapshot, options) {
        options = options || {};
        const sheetData = snapshot.sheetData || {};
        const sheetNames = Object.keys(sheetData);
        if (sheetNames.length === 0) {
            sheetNames.push('Sheet1');
            sheetData['Sheet1'] = [['类别', '名称', '单位', '填报指引', '数值', '备注']];
        }

        const spread = new SpreadNS.Workbook(hostEl, { sheetCount: sheetNames.length });
        spread.options.tabStripVisible = sheetNames.length > 1;
        spread.options.newTabVisible = false;

        if (typeof GC.Spread.Common.CultureManager !== 'undefined') {
            try {
                GC.Spread.Common.CultureManager.culture('zh-cn');
            } catch (e) {}
        }

        sheetNames.forEach((name, index) => {
            const sheet = spread.getSheet(index);
            sheet.name(name);
            const data = sheetData[name] || [];
            if (data.length > 0) {
                sheet.setArray(0, 0, data);
                const colCount = data[0] ? data[0].length : 0;
                const headerStyle = new SpreadNS.Style();
                headerStyle.backColor = '#f0f2f5';
                headerStyle.font = 'bold 12px sans-serif';
                headerStyle.hAlign = SpreadNS.HorizontalAlign.center;
                sheet.getRange(0, 0, 0, Math.max(colCount - 1, 0)).setStyle(headerStyle);
                if (colCount > 1) sheet.setColumnWidth(1, 140);
            }
        });

        if (options.readOnly) {
            setSpreadReadOnly(spread);
        } else if (options.editableCols && options.editableCols.length > 0) {
            setEditableColumns(spread, options.editableCols);
        }

        if (typeof options.onValueChanged === 'function') {
            spread.bind(SpreadNS.Events.ValueChanged, options.onValueChanged);
        }

        return spread;
    }

    /**
     * 导出当前 Spread 为 Snapshot 格式的 sheetData 部分
     * @param {GC.Spread.Sheets.Workbook} spread
     * @param {Object} extra - 可合并的额外字段，如 { templateId, evidenceRequirements }
     * @returns {Object} Snapshot 对象
     */
    function getSnapshotFromSpread(spread, extra) {
        extra = extra || {};
        const sheetData = {};
        for (let i = 0; i < spread.getSheetCount(); i++) {
            const sheet = spread.getSheet(i);
            const name = sheet.name();
            const usedRange = sheet.getUsedRange(SpreadNS.UsedRangeType.data);
            if (usedRange) {
                const rowCount = usedRange.rowCount;
                const colCount = usedRange.columnCount;
                const arr = [];
                for (let r = 0; r < rowCount; r++) {
                    const row = [];
                    for (let c = 0; c < colCount; c++) {
                        const val = sheet.getValue(usedRange.row + r, usedRange.col + c);
                        row.push(val !== undefined && val !== null ? val : '');
                    }
                    arr.push(row);
                }
                sheetData[name] = arr.length > 0 ? arr : [['类别', '名称', '单位', '填报指引', '数值', '备注']];
            } else {
                sheetData[name] = [['类别', '名称', '单位', '填报指引', '数值', '备注']];
            }
        }
        return Object.assign({ version: '1.0', sheetData }, extra);
    }

    /**
     * 指定可编辑列（其余列锁定），列索引从 0 起
     * @param {GC.Spread.Sheets.Workbook} spread
     * @param {number[]} colIndexes - 可编辑列索引，如 [3, 4] 表示数值、备注列
     */
    function setEditableColumns(spread, colIndexes) {
        const editableSet = new Set(colIndexes || []);
        for (let i = 0; i < spread.getSheetCount(); i++) {
            const sheet = spread.getSheet(i);
            sheet.options.isProtected = true;
            const rowCount = sheet.getRowCount();
            const colCount = sheet.getColumnCount();
            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < colCount; c++) {
                    const cell = sheet.getCell(r, c);
                    if (cell) {
                        const style = cell.style() || new SpreadNS.Style();
                        style.locked = !editableSet.has(c);
                        cell.style(style);
                    }
                }
            }
        }
    }

    /**
     * 全表只读
     * @param {GC.Spread.Sheets.Workbook} spread
     */
    function setSpreadReadOnly(spread) {
        for (let i = 0; i < spread.getSheetCount(); i++) {
            spread.getSheet(i).options.isProtected = true;
        }
    }

    /**
     * 解析上传的 Excel 文件为 sheetData（依赖全局 XLSX/SheetJS，页面需先引入如 cdn.sheetjs.com）
     * @param {File} file - xlsx/xls 文件
     * @returns {Promise<Object|null>} { sheetData: { SheetName: [[...]], ... } } 或 null（解析失败或未加载 XLSX）
     */
    function parseExcelFile(file) {
        if (!file || typeof (global.XLSX || (typeof window !== 'undefined' && window.XLSX)) === 'undefined') {
            return Promise.resolve(null);
        }
        const XLSXLib = global.XLSX || (typeof window !== 'undefined' && window.XLSX);
        return new Promise(function (resolve) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = e.target && e.target.result;
                    if (!data) { resolve(null); return; }
                    const wb = XLSXLib.read(data, { type: 'array', cellNF: false, cellDates: false });
                    const sheetData = {};
                    (wb.SheetNames || []).forEach(function (name) {
                        const sheet = wb.Sheets[name];
                        if (!sheet) return;
                        try {
                            const rows = XLSXLib.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
                            if (rows && rows.length > 0) sheetData[name] = rows;
                        } catch (err) { /* 单 sheet 解析失败时跳过 */ }
                    });
                    resolve(Object.keys(sheetData).length > 0 ? { sheetData: sheetData } : null);
                } catch (err) {
                    console.error('parseExcelFile:', err);
                    resolve(null);
                }
            };
            reader.onerror = function () { resolve(null); };
            reader.readAsArrayBuffer(file);
        });
    }

    global.SpreadUtils = {
        createSpreadFromSnapshot,
        getSnapshotFromSpread,
        setEditableColumns,
        setSpreadReadOnly,
        parseExcelFile
    };
})(typeof window !== 'undefined' ? window : this);
