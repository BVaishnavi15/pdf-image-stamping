from pydantic import BaseModel


class StampCoordinates(BaseModel):
    x: float
    y: float
    width: float
    height: float
