'use client'

import { useEffect, useRef } from 'react'
import { mount } from './engine'

export default function Prototype() {
  const ref = useRef(null)
  useEffect(() => { mount(ref.current) }, [])
  return <div id="app" ref={ref} />
}
