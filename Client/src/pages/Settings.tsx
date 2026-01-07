import { AccountSettingsCards, ChangePasswordCard, DeleteAccountCard } from "@daveyplate/better-auth-ui"

const Settings = () => {
  return (
    <div className="w-full pt-10 pb-20 px-10 flex flex-col gap-6 justify-center items-center min-h-[90vh]">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-300">Account Settings</h1>
        <AccountSettingsCards classNames={{
            card: {
                base: 'bg-black/10 ring ring-white/20 max-w-xl mx-auto pt-3 gap-4',
                footer: 'bg-black/10 ring-top ring-gray-600'
            }
             }}/>
        <div className="w-full">
            <ChangePasswordCard classNames={{
                base: 'bg-black/10 ring ring-white/20 w-full max-w-xl mx-auto pt-3 gap-4',
                footer: 'bg-black/10 ring-top ring-gray-600'
             }}/>
        </div>
        <div className="w-full">
            <DeleteAccountCard  classNames={{
                base: 'bg-black/10 ring ring-white/20 w-full max-w-xl mx-auto pt-3 gap-4',
             }}/>
        </div>
    </div>
  )
}

export default Settings
