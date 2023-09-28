const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirmer</button>
        <button onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
};

export default ConfirmationModal