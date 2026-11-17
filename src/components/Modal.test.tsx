import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  it('não propaga o submit para um formulário que abriu o modal', () => {
    const handleParentSubmit = vi.fn();
    const handleModalSubmit = vi.fn();

    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleParentSubmit();
        }}
      >
        <Modal
          open
          title="Cadastrar exercício"
          handleClose={vi.fn()}
          handleSubmit={handleModalSubmit}
        >
          <label htmlFor="exercise-name">Nome</label>
          <input id="exercise-name" />
        </Modal>
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(handleModalSubmit).toHaveBeenCalledOnce();
    expect(handleParentSubmit).not.toHaveBeenCalled();
  });
});
