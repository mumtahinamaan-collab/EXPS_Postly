import React, { useState, useEffect } from 'react'
import { dummyPostsData } from '../assets/dummyData'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'

const Feed = () => {
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData)
    setLoading(false)
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 flex justify-center bg-gray-50'>
      <div className='w-full max-w-2xl'>



        <div className='flex flex-col gap-4'>
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Feed