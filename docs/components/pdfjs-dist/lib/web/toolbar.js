/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var uiUtils = require('./ui_utils.js');
var mozL10n = uiUtils.mozL10n;
var noContextMenuHandler = uiUtils.noContextMenuHandler;
var animationStarted = uiUtils.animationStarted;
var localized = uiUtils.localized;
var DEFAULT_SCALE_VALUE = uiUtils.DEFAULT_SCALE_VALUE;
var DEFAULT_SCALE = uiUtils.DEFAULT_SCALE;
var MIN_SCALE = uiUtils.MIN_SCALE;
var MAX_SCALE = uiUtils.MAX_SCALE;
var PAGE_NUMBER_LOADING_INDICATOR = 'visiblePageIsLoading';
var SCALE_SELECT_CONTAINER_PADDING = 8;
var SCALE_SELECT_PADDING = 22;
var Toolbar = function ToolbarClosure() {
  function Toolbar(options, mainContainer, eventBus) {
    this.toolbar = options.container;
    this.mainContainer = mainContainer;
    this.eventBus = eventBus;
    this.items = options;
    this._wasLocalized = false;
    this.reset();
    this._bindListeners();
  }
  Toolbar.prototype = {
    setPageNumber: function (pageNumber, pageLabel) {
      this.pageNumber = pageNumber;
      this.pageLabel = pageLabel;
      this._updateUIState(false);
    },
    setPagesCount: function (pagesCount, hasPageLabels) {
      this.pagesCount = pagesCount;
      this.hasPageLabels = hasPageLabels;
      this._updateUIState(true);
    },
    setPageScale: function (pageScaleValue, pageScale) {
      this.pageScaleValue = pageScaleValue;
      this.pageScale = pageScale;
      this._updateUIState(false);
    },
    reset: function () {
      this.pageNumber = 0;
      this.pageLabel = null;
      this.hasPageLabels = false;
      this.pagesCount = 0;
      this.pageScaleValue = DEFAULT_SCALE_VALUE;
      this.pageScale = DEFAULT_SCALE;
      this._updateUIState(true);
    },
    _bindListeners: function Toolbar_bindClickListeners() {
      var eventBus = this.eventBus;
      var self = this;
      var items = this.items;
      items.previous.addEventListener('click', function () {
        eventBus.dispatch('previouspage');
      });
      items.next.addEventListener('click', function () {
        eventBus.dispatch('nextpage');
      });
      items.zoomIn.addEventListener('click', function () {
        eventBus.dispatch('zoomin');
      });
      items.zoomOut.addEventListener('click', function () {
        eventBus.dispatch('zoomout');
      });
      items.pageNumber.addEventListener('click', function () {
        this.select();
      });
      items.pageNumber.addEventListener('change', function () {
        eventBus.dispatch('pagenumberchanged', {
          source: self,
          value: this.value
        });
      });
      items.scaleSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
          return;
        }
        eventBus.dispatch('scalechanged', {
          source: self,
          value: this.value
        });
      });
      items.presentationModeButton.addEventListener('click', function (e) {
        eventBus.dispatch('presentationmode');
      });
      items.openFile.addEventListener('click', function (e) {
        eventBus.dispatch('openfile');
      });
      items.print.addEventListener('click', function (e) {
        eventBus.dispatch('print');
      });
      items.download.addEventListener('click', function (e) {
        eventBus.dispatch('download');
      });
      items.scaleSelect.oncontextmenu = noContextMenuHandler;
      localized.then(this._localized.bind(this));
    },
    _localized: function Toolbar_localized() {
      this._wasLocalized = true;
      this._adjustScaleWidth();
      this._updateUIState(true);
    },
    _updateUIState: function Toolbar_updateUIState(resetNumPages) {
      function selectScaleOption(value, scale) {
        var options = items.scaleSelect.options;
        var predefinedValueFound = false;
        for (var i = 0, ii = options.length; i < ii; i++) {
          var option = options[i];
          if (option.value !== value) {
            option.selected = false;
            continue;
          }
          option.selected = true;
          predefinedValueFound = true;
        }
        if (!predefinedValueFound) {
          var customScale = Math.round(scale * 10000) / 100;
          items.customScaleOption.textContent = mozL10n.get('page_scale_percent', { scale: customScale }, '{{scale}}%');
          items.customScaleOption.selected = true;
        }
      }
      if (!this._wasLocalized) {
        return;
      }
      var pageNumber = this.pageNumber;
      var scaleValue = (this.pageScaleValue || this.pageScale).toString();
      var scale = this.pageScale;
      var items = this.items;
      var pagesCount = this.pagesCount;
      if (resetNumPages) {
        if (this.hasPageLabels) {
          items.pageNumber.type = 'text';
        } else {
          items.pageNumber.type = 'number';
          items.numPages.textContent = mozL10n.get('of_pages', { pagesCount: pagesCount }, 'of {{pagesCount}}');
        }
        items.pageNumber.max = pagesCount;
      }
      if (this.hasPageLabels) {
        items.pageNumber.value = this.pageLabel;
        items.numPages.textContent = mozL10n.get('page_of_pages', {
          pageNumber: pageNumber,
          pagesCount: pagesCount
        }, '({{pageNumber}} of {{pagesCount}})');
      } else {
        items.pageNumber.value = pageNumber;
      }
      items.previous.disabled = pageNumber <= 1;
      items.next.disabled = pageNumber >= pagesCount;
      items.zoomOut.disabled = scale <= MIN_SCALE;
      items.zoomIn.disabled = scale >= MAX_SCALE;
      selectScaleOption(scaleValue, scale);
    },
    updateLoadingIndicatorState: function Toolbar_updateLoadingIndicatorState(loading) {
      var pageNumberInput = this.items.pageNumber;
      if (loading) {
        pageNumberInput.classList.add(PAGE_NUMBER_LOADING_INDICATOR);
      } else {
        pageNumberInput.classList.remove(PAGE_NUMBER_LOADING_INDICATOR);
      }
    },
    _adjustScaleWidth: function Toolbar_adjustScaleWidth() {
      var container = this.items.scaleSelectContainer;
      var select = this.items.scaleSelect;
      animationStarted.then(function () {
        if (container.clientWidth === 0) {
          container.setAttribute('style', 'display: inherit;');
        }
        if (container.clientWidth > 0) {
          select.setAttribute('style', 'min-width: inherit;');
          var width = select.clientWidth + SCALE_SELECT_CONTAINER_PADDING;
          select.setAttribute('style', 'min-width: ' + (width + SCALE_SELECT_PADDING) + 'px;');
          container.setAttribute('style', 'min-width: ' + width + 'px; ' + 'max-width: ' + width + 'px;');
        }
      });
    }
  };
  return Toolbar;
}();
exports.Toolbar = Toolbar;