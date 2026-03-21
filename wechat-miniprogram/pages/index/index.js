const app = getApp();
const { computeFilterProgress } = require('../../utils/filters');
const { getColorByProgress } = require('../../utils/color');

function normalizeDateInput(input) {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

Page({
  data: {
    filters: [],
    cloudKey: null,
    isSyncing: false,
    unitTitle: '长虹H502',
    locked: true,
    editingTitle: false,
    titleDraft: '',

    showContextMenu: false,
    contextLetter: '',

    showDeleteConfirm: false,

    showEditModal: false,
    editForm: {
      letter: '',
      label: '',
      lifespanDays: '180',
      startDate: '',
    },
  },

  onLoad() {
    this.refreshView();
    this.interval = setInterval(() => {
      this.refreshView();
    }, 60 * 60 * 1000);
  },

  onShow() {
    this.refreshView();
  },

  onUnload() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  refreshView() {
    const sourceFilters = app.globalData.filters || [];
    const prevToggleMap = {};
    (this.data.filters || []).forEach((item) => {
      prevToggleMap[item.letter] = !!item.showDays;
    });

    const filters = sourceFilters.map((f) => {
      const result = computeFilterProgress(f);
      return {
        ...f,
        progress: result.progress,
        progressPercent: Math.round(result.progress * 100),
        remainingDays: result.remaining,
        color: getColorByProgress(result.progress),
        showDays: prevToggleMap[f.letter] || false,
      };
    });

    this.setData({
      filters,
      cloudKey: app.globalData.cloudKey,
      isSyncing: app.globalData.isSyncing,
      unitTitle: app.globalData.unitTitle || '长虹H502',
      titleDraft: this.data.editingTitle ? this.data.titleDraft : (app.globalData.unitTitle || '长虹H502'),
    });
  },

  toggleLock() {
    this.setData({ locked: !this.data.locked });
  },

  startEditTitle() {
    if (this.data.locked) return;
    this.setData({
      editingTitle: true,
      titleDraft: this.data.unitTitle,
    });
  },

  onTitleInput(e) {
    this.setData({ titleDraft: e.detail.value });
  },

  async confirmTitle() {
    const title = (this.data.titleDraft || '').trim();
    if (!title) {
      this.setData({ editingTitle: false, titleDraft: this.data.unitTitle });
      return;
    }
    try {
      await app.setTitle(title);
      this.setData({ editingTitle: false });
      this.refreshView();
    } catch (error) {
      wx.showToast({ title: '保存标题失败', icon: 'none' });
    }
  },

  cancelTitleEdit() {
    this.setData({
      editingTitle: false,
      titleDraft: this.data.unitTitle,
    });
  },

  toggleDisplayMode(e) {
    const index = e.currentTarget.dataset.index;
    const list = [...this.data.filters];
    if (!list[index]) return;
    list[index].showDays = !list[index].showDays;
    this.setData({ filters: list });
  },

  onFilterLongPress(e) {
    const letter = e.currentTarget.dataset.letter;
    if (!letter) return;
    this.setData({
      showContextMenu: true,
      contextLetter: letter,
    });
  },

  closeContextMenu() {
    this.setData({
      showContextMenu: false,
      contextLetter: '',
    });
  },

  openDeleteConfirm() {
    this.setData({
      showContextMenu: false,
      showDeleteConfirm: true,
    });
  },

  async confirmDeleteFilter() {
    const letter = this.data.contextLetter;
    if (!letter) return;
    try {
      await app.deleteFilter(letter);
      this.setData({
        showDeleteConfirm: false,
        contextLetter: '',
      });
      this.refreshView();
    } catch (error) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  cancelDelete() {
    this.setData({
      showDeleteConfirm: false,
      contextLetter: '',
    });
  },

  openEditModal() {
    const letter = this.data.contextLetter;
    const current = (app.globalData.filters || []).find((f) => f.letter === letter);
    if (!current) {
      this.closeContextMenu();
      return;
    }

    this.setData({
      showContextMenu: false,
      showEditModal: true,
      editForm: {
        letter: current.letter,
        label: current.label || '',
        lifespanDays: String(current.lifespanDays),
        startDate: normalizeDateInput(current.startedAt),
      },
    });
  },

  closeEditModal() {
    this.setData({
      showEditModal: false,
      editForm: {
        letter: '',
        label: '',
        lifespanDays: '180',
        startDate: '',
      },
    });
  },

  onEditLabelInput(e) {
    this.setData({ 'editForm.label': e.detail.value });
  },

  onEditLifespanInput(e) {
    this.setData({ 'editForm.lifespanDays': e.detail.value });
  },

  onEditDateInput(e) {
    this.setData({ 'editForm.startDate': e.detail.value });
  },

  resetEditDate() {
    this.setData({ 'editForm.startDate': normalizeDateInput(Date.now()) });
  },

  async saveEditFilter() {
    const { letter, label, lifespanDays, startDate } = this.data.editForm;
    const target = (app.globalData.filters || []).find((f) => f.letter === letter);
    if (!target) {
      wx.showToast({ title: '滤芯不存在', icon: 'none' });
      return;
    }

    const days = parseInt(lifespanDays, 10);
    if (Number.isNaN(days) || days <= 0) {
      wx.showToast({ title: '请输入有效寿命天数', icon: 'none' });
      return;
    }

    const timestamp = new Date(startDate).getTime();
    if (Number.isNaN(timestamp)) {
      wx.showToast({ title: '请输入有效日期', icon: 'none' });
      return;
    }

    const updated = {
      ...target,
      label: (label || '').trim() || undefined,
      lifespanDays: days,
      startedAt: timestamp,
    };

    try {
      await app.updateFilter(updated);
      this.closeEditModal();
      this.refreshView();
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  async addFilter() {
    if (this.data.locked) return;
    try {
      await app.addFilter();
      this.refreshView();
    } catch (error) {
      wx.showToast({ title: error.message || '添加失败', icon: 'none' });
    }
  },

  async removeLastFilter() {
    if (this.data.locked || !this.data.filters.length) return;
    try {
      await app.removeLastFilter();
      this.refreshView();
    } catch (error) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  copyCloudKey() {
    if (!this.data.cloudKey) return;
    wx.setClipboardData({
      data: this.data.cloudKey,
      success: () => {
        wx.showToast({ title: '同步密钥已复制', icon: 'success' });
      },
    });
  },

  noop() {},
});
