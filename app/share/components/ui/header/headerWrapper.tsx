interface HeaderWrapperProps {
  children: React.ReactNode; //header
}
//65% trở lên trước => 000 = đen = ẩn mask
//75 sương sương
//100 trong suốt
export async function HeaderWrapper({ children }: HeaderWrapperProps) {
  return (
    <div className="h-[66px] fixed top-0 left-0  w-screen z-21 text-black">
      <div
        className="absolute inset-0 backdrop-blur-2xl 
          bg-[linear-gradient(#dde2ee66,#dde2ee00)] 
          mask-[linear-gradient(#000_65%,#000000e0_75%,#0000)] w-full"
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
