(function() {
    'use strict';

    /**
     * Make a group of items sortable
     * @method Sortable
     * @param options {Object} Object of options
     * @param options.els {Array<HTMLElement>|string} Elements that are sortable
     * @param options.type {'insert'|'swap'} Moving inserts or swaps items
     * @param options.onDragEnter {Function} Item enters a drop target
     * @param options.onDragOver {Function} Item over drop target
     * @param options.onDragLeave {Function} Item leaves a drop target
     * @param options.onDragStart {Function} Item started dragging
     * @param options.onDragStart {Function} Item stopped dragging
     * @param options.onDrop {Function} Item is dropped
     * @returns {{destroy: destroy}}
     * @constructor
     */
    function Sortable(options) {
        var dragEl,
            type,
            slice = function(arr, start, end) {
                return Array.prototype.slice.call(arr, start, end)
            },
            sortables,
            overClass,
            movingClass;

        function handleDragStart(e) {
            e.dataTransfer.effectAllowed = 'move';

            dragEl = this;

            // this/e.target is the source node.
            this.classList.add(movingClass);
            [].forEach.call(sortables, function(col) {
                col.classList.add('droppable');
            });
            this.classList.remove('droppable');

            options.onDragStart && options.onDragStart(e);
        }

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Allows us to drop.
            }

            e.dataTransfer.dropEffect = 'move';

            options.onDragOver && options.onDragOver(e);
            return false;
        }

        function handleDragEnter() {
            this.classList.add(overClass);

            options.onDragEnter && options.onDragEnter(e);
        }

        function handleDragLeave() {
            // this/e.target is previous target element.
            this.classList.remove(overClass);

            options.onDragLeave && options.onDragLeave(e);
        }

        function handleDrop(e) {
            var dropParent, dropIndex, dragIndex;

            // this/e.target is current target element.
            if (e.stopPropagation) {
                e.stopPropagation(); // stops the browser from redirecting.
            }

            // Don't do anything if we're dropping on the same column we're dragging.
            if (dragEl !== this) {
                dropParent = this.parentNode;
                dragIndex = slice(dragEl.parentNode.children).indexOf(dragEl);

                if (type === 'swap') {
                    dropParent.insertBefore(dragEl, this);
                    if (dragIndex === 0 && !dropParent.children[0]) {
                        dropParent.appendChild(this);
                    } else {
                        dropParent.insertBefore(this, dropParent.children[dragIndex]);
                    }
                } else {
                    dropIndex = slice(this.parentNode.children).indexOf(this);
                    if (this.parentNode === dragEl.parentNode && dropIndex > dragIndex) {
                        dropParent.insertBefore(dragEl, this.nextSibling);
                    } else {
                        dropParent.insertBefore(dragEl, this);
                    }
                }
            }


            options.onDrop && options.onDrop(e);

            dragEl = null;

            return false;
        }

        function handleDragEnd() {
            [].forEach.call(sortables, function(col) {
                col.classList.remove(overClass, movingClass);
                col.classList.remove('droppable');
            });

            options.onDragEnd && options.onDragEnd(e);
        }

        function destroy() {
            sortables.forEach(function(col) {
                col.removeAttribute('draggable', 'true'); // Enable columns to be draggable.
                modifyListeners(col, false);
            });
            sortables = null;
            dragEl = null;
        }

        function modifyListeners(el, isAdd) {
            var addOrRemove = isAdd ? 'add' : 'remove';

            el[addOrRemove + 'EventListener']('dragstart', handleDragStart);
            el[addOrRemove + 'EventListener']('dragenter', handleDragEnter);
            el[addOrRemove + 'EventListener']('dragover', handleDragOver);
            el[addOrRemove + 'EventListener']('dragleave', handleDragLeave);
            el[addOrRemove + 'EventListener']('drop', handleDrop);
            el[addOrRemove + 'EventListener']('dragend', handleDragEnd);
        }

        function init() {
            if (typeof options.els === 'string') {
                sortables = slice(document.querySelectorAll(options.els));
            } else {
                sortables = slice(options.els);
            }

            type = options.type || 'insert'; // insert or swap
            overClass = options.overClass || 'sortable-over';
            movingClass = options.movingClass || 'sortable-moving';

            sortables.forEach(function(col) {
                col.setAttribute('draggable', 'true'); // Enable columns to be draggable.
                modifyListeners(col, true)
            });
        }

        init();

        return {
            destroy: destroy
        };
    }

    if (typeof module !== 'undefined' && module['exports']) {
        module['exports'] = Sortable;
    } else if (typeof define !== 'undefined' && define.amd) {
        define(function() {
            return Sortable;
        });
    } else {
        window['Sortable'] = Sortable;
    }
})();

//Under MIT License https://github.com/taylorhakes/html5-sortable
