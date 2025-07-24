import "./Loader.css"

function Loader() {
  return (
    <>
      <svg className="spinner" viewBox="0 0 48 48" role="img" aria-label="Animação de carregamento com confetes">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4">
          <circle className="spinner__worm" cx="24" cy="24" r="22" strokeDasharray="138.23 138.23" strokeDashoffset="-51.84" transform="rotate(-119)" />
          <circle className="spinner__pop-end" stroke="var(--light-green)" cx="24" cy="24" r="18" opacity="0" />
          <g fill="currentColor" stroke="none">
            <circle className="spinner__pop-start" fill="var(--light-green)" cx="24" cy="24" r="20" opacity="0" />
            <g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--periwinkle)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-blue)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(51.43,24,24)">
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--orange)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--magenta)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(102.86,24,24)">
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-green)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-teal)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(154.29,24,24)">
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--purple)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--magenta)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(205.71,24,24)">
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-teal)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-blue)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(257.14,24,24)">
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--periwinkle)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-blue)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(308.57,24,24)">
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--purple)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="spinner__pop-dot-group" opacity="0">
                <circle className="spinner__pop-dot" fill="var(--light-teal)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
          </g>
          <path className="spinner__check" d="M 17 25 L 22 30 C 22 30 32.2 19.8 37.3 14.7 C 41.8 10.2 39 7.9 39 7.9" strokeDasharray="36.7 36.7" strokeDashoffset="-36.7" />
        </g>
      </svg>
    </>
  )
}

export default Loader;