import { FC } from "react";
import { Button } from "@app/components/button";

const Home: FC<{ time: string }> = ({ time }) => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Current time: {time}</p>
      <Button onClick={() => alert("Button clicked!")}>
        Click Me
      </Button>
    </div>
  );
};

export default Home;
