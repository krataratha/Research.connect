import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Button from '../../../components/common/buttons/Button';
import Modal from '../../../components/common/modals/Modal';
import profileService from '../../../services/profile.service';
import authService from '../../../services/auth.service';
import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/common/inputs/Input';

const DangerZoneSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to temporarily deactivate your account? Your profile and uploads will be hidden until you log back in.')) {
      return;
    }
    setIsDeactivating(true);
    try {
      const response = await authService.deactivateAccount();
      if (response && response.success) {
        toast.success('Your account has been deactivated successfully.');
        dispatch(logoutSuccess());
        navigate('/login');
      } else {
        throw new Error(response?.message || 'Deactivation failed.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred.');
      toast.error(errMsg);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await profileService.deleteProfile();
      if (response && response.success) {
        toast.success('Your profile and account have been successfully deleted.');
        dispatch(logoutSuccess());
        setIsModalOpen(false);
        navigate('/login');
      } else {
        throw new Error(response?.message || 'Delete account failed.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred.');
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Card 1 - Deactivate Account */}
      <div className="bg-[#FFF8E8]/60 border border-amber-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-amber-100/50">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-xs font-black text-amber-800 uppercase tracking-tight">Deactivate Account</h3>
        </div>

        <p className="text-[11px] text-amber-900/80 font-semibold leading-relaxed">
          Temporarily disable your profile, research feeds, and visibility search indexing. You can restore your full account history and reactivate at any time by logging back in.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <span className="text-[10px] text-amber-700/60 font-semibold">
            <span className="font-extrabold text-amber-600 uppercase mr-1">Note:</span> Your uploads and search visibility status will remain hidden until you reactivate.
          </span>
          <button
            onClick={handleDeactivate}
            disabled={isDeactivating}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
          </button>
        </div>
      </div>

      {/* Card 2 - Delete Account */}
      <div className="bg-[#FFF2F2]/60 border border-red-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-red-100/50">
          <Trash2 className="w-5 h-5 text-accent-red" />
          <h3 className="text-xs font-black text-accent-red uppercase tracking-tight">Delete Account Permanently</h3>
        </div>

        <p className="text-[11px] text-red-900/80 font-semibold leading-relaxed">
          Deleting your account is permanent. All your profile data, academic metrics, co-authors list, and stored publications will be permanently wiped from our databases. This action cannot be reversed.
        </p>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => {
              setConfirmText('');
              setIsModalOpen(true);
            }}
            disabled={isDeleting}
            className="w-full sm:w-auto font-bold text-xs px-5 py-2.5 bg-accent-red hover:bg-red-650 text-white rounded-xl shadow-sm transition-all active:scale-95"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Account Deletion"
        size="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-accent-red flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-accent-red uppercase tracking-tight">Warning: Irreversible Action</h4>
              <p className="text-[10px] text-red-800/70 font-semibold leading-relaxed">
                You are about to delete your Research Connect researcher account. All metrics, co-author linkages, and stored data will be soft-deleted and scheduled for pruning.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-text-primary font-bold">
              To proceed, please type <span className="text-accent-red font-black uppercase">DELETE</span> below:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              disabled={isDeleting}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="ghost"
              disabled={isDeleting}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETE' || isDeleting}
              loading={isDeleting}
              variant="danger"
              className="text-xs font-bold px-5"
            >
              Confirm Permanent Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DangerZoneSettings;
