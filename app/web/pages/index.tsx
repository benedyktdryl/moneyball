import Link from "next/link";

function About() {
  return (
    <ul>
      <li>
        <div>
          <Link href="/charts/points-per-round">
            <a>points per round</a>
          </Link>
        </div>
        <div>
          <Link href="/charts/points-per-price">
            <a>points per price</a>
          </Link>
        </div>
        <div>
          <Link href="/charts/points-per-position">
            <a>points per position</a>
          </Link>
        </div>
      </li>
    </ul>
  );
}

export default About;
