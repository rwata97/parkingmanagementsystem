import { useState } from "react";
import { Button, Text } from "@/components/atoms";
import { Modal } from "@/components/molecules";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function RunRaffleDialog({ open, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Run raffle now?">
      <Text>
        This will randomly allocate available parking spots. Residents who have{" "}
        <b>not</b> been selected in previous cycles will receive priority. You
        can review results immediately after it completes.
      </Text>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={confirm} isLoading={loading}>
          Run Raffle
        </Button>
      </div>
    </Modal>
  );
}
