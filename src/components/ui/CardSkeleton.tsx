export function StatsSkeleton() {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {[1,2,3,4].map(function(i) { return (
        <div key={i} className='glass-card rounded-xl p-4 text-center'>
          <div className='animate-pulse h-8 w-20 bg-white/10 rounded mx-auto' />
          <div className='animate-pulse h-4 w-16 bg-white/10 rounded mx-auto mt-2' />
        </div>
      )})}
    </div>
  )
}

export function ProfitSkeleton() {
  return (
    <div className='bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]'>
      <div className='animate-pulse h-4 w-24 bg-white/10 rounded mb-3' />
      <div className='animate-pulse h-8 w-32 bg-white/10 rounded mb-2' />
      <div className='animate-pulse h-4 w-40 bg-white/10 rounded' />
      <div className='mt-4 animate-pulse h-1 bg-white/10 rounded-full' />
      <div className='flex justify-between mt-2'>
        <div className='animate-pulse h-3 w-8 bg-white/10 rounded' />
        <div className='animate-pulse h-3 w-16 bg-white/10 rounded' />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className='animate-pulse bg-white/5 rounded-xl p-6 border border-white/5'>
      <div className='h-4 w-24 bg-white/10 rounded mb-4' />
      <div className='h-8 w-32 bg-white/10 rounded mb-2' />
      <div className='h-4 w-48 bg-white/10 rounded' />
    </div>
  )
}
