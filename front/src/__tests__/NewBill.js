/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';
import { ROUTES_PATH } from '../constants/routes.js';
import NewBill from '../containers/NewBill.js';
import { bills } from '../fixtures/bills.js';
import NewBillUI from '../views/NewBillUI.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then mail icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const windowIcon = screen.getByTestId('icon-mail');

      expect(windowIcon.className).toEqual('active-icon');
    });

    describe('When I choose a file with correct form of extension file to upload', () => {
      test('Then the chosen file should be uploaded', () => {
        document.body.innerHTML = NewBillUI();
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
        );
        document.body.innerHTML = NewBillUI({ data: [bills[0]] });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const testNewbill = new NewBill({
          document,
          onNavigate,
          localStorage: window.localStorage,
          store: mockStore,
        });
        const addFileBtn = screen.getByTestId('file');
        const file = new File(['image'], 'image.jpg', { type: 'image/jpeg' });
        const handleChangeFile = jest.fn(() => {
          testNewbill.handleChangeFile;
        });
        addFileBtn.addEventListener('change', handleChangeFile);
        fireEvent.change(addFileBtn, { target: { files: [file] } });

        expect(addFileBtn).toBeTruthy();
        expect(handleChangeFile).toHaveBeenCalled();
        expect(addFileBtn.files).toHaveLength(1);
        expect(addFileBtn.files[0].name).toBe('image.jpg');
      });
    });

    describe('When I choose a file with incorrect form of extension of file to upload', () => {
      test("Then it shouldn't be uploaded", () => {
        document.body.innerHTML = NewBillUI();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        const mockFile = { path: 'wrongFile.ext', type: 'ext' };
        const newBillController = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn(newBillController.handleChangeFile);
        const fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change', handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File([mockFile['path']], mockFile['path'], {
                type: mockFile['type'],
              }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(
          'Seuls les fichiers aux formats .jpg/.jpeg/.png sont acceptés'
        );
      });
    });

    describe('When I submit the form', () => {
      test('Then it should create a new bill', async () => {
        document.body.innerHTML = NewBillUI();
        const mockBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        const handleSubmitSpy = jest.spyOn(mockBill, 'handleSubmit');
        const form = screen.getByTestId('form-new-bill');
        const submitBtn = form.querySelector('#btn-send-bill');
        const updateBillSpy = jest.spyOn(mockBill, 'updateBill');
        form.addEventListener('submit', (event) =>
          mockBill.handleSubmit(event)
        );
        userEvent.click(submitBtn);

        expect(handleSubmitSpy).toHaveBeenCalled();
        expect(updateBillSpy).toHaveBeenCalled();
      });
    });
  });
});
