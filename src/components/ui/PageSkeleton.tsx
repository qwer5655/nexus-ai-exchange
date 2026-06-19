export function ProfileSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='animate-pulse h-8 w-48 bg-white/10 rounded' />
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='glass-card rounded-xl p-6 border border-white/5'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='w-16 h-16 rounded-full bg-white/10' />
              <div><div className='h-5 w-32 bg-white/10 rounded mb-1' /><div className='h-4 w-24 bg-white/10 rounded' /></div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>{[1,2,3,4].map(function(i){return(<div key={i} className='glass-card rounded-xl p-4 text-center'><div className='h-8 w-20 bg-white/10 rounded mx-auto mb-2' /><div className='h-4 w-16 bg-white/10 rounded mx-auto' /></div>)})}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DepositSkeleton() {
  return (
    <div className='min-h-screen bg-[#0B1220]'>
      <div className='max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6'>
        <div className='grid grid-cols-3 gap-3 sm:gap-4 mb-5'>{[1,2,3].map(function(i){return(<div key={i} className='bg-[#141C2F] rounded-2xl p-4 border border-white/[0.04]'><div className='animate-pulse h-4 w-16 bg-white/10 rounded mb-2' /><div className='animate-pulse h-6 w-24 bg-white/10 rounded' /></div>)})}</div>
      </div>
    </div>
  )
}
