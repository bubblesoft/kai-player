/**
 * Created by qhyang on 2018/4/12.
 */

import interact from 'interactjs';

import '../styles/vue-confirm';

export default {
    install(Vue) {
        const dialog = document.createElement('div');

        dialog.setAttribute('role', 'dialog');
        dialog.classList.add('modal');

        dialog.innerHTML = `
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <slot name="modal-header">
                        <div class="modal-header">
                            <button type="button" class="close"><span>&times;</span></button>
                            <h4 class="modal-title"></h4>
                        </div>
                    </slot>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default btn-sm"></button>
                        <button type="button" class="btn btn-primary btn-sm"></button>
                    </div>
                  </div>
            </div>
        `;

        const body = document.body;

        body.appendChild(dialog);

        const modalTitle = dialog.querySelector('.modal-title');
        const modalBody = dialog.querySelector('.modal-body');
        const confirmButton = dialog.querySelector('.btn-primary');
        const cancelButton = dialog.querySelector('.btn-default');

        const confirmButtonInteractable = interact(confirmButton);
        const cancelButtonInteractable = interact(cancelButton);

        const close = () => {
            dialog.classList.remove('in');

            setTimeout(() => {
                dialog.style.display = 'none';
                body.classList.remove('modal-open');
            }, 300);
        };

        interact(dialog.querySelector('.modal-content')).on('tap', e => e.stopPropagation());
        interact(dialog.querySelector('.close')).on('tap', close);
        interact(dialog).on('tap', close);

        Vue.prototype.$confirm = ({ title, bodyText, confirmText, cancelText }) => {
            modalTitle.innerHTML = '';
            modalTitle.appendChild(document.createTextNode(title));

            modalBody.innerHTML = '';
            modalBody.appendChild(document.createTextNode(bodyText));

            confirmButton.innerHTML = '';
            confirmButton.appendChild(document.createTextNode(confirmText));

            cancelButton.innerHTML = '';
            cancelButton.appendChild(document.createTextNode(cancelText));

            dialog.querySelector('.modal-content').focus();
            dialog.style.display = 'block';
            setTimeout(() => dialog.classList.add('in'), 0);
            body.classList.add('modal-open');

            return new Promise((resolve, reject) => {
                confirmButtonInteractable.on('tap', e => {
                    resolve();
                    close();
                });
                cancelButtonInteractable.on('tap', () => {
                    reject();
                    close();
                });
            });
        };
    }
}
