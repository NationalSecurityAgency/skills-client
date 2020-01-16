package skills

class ReleaseClientLibs {

    public static void main(String[] args) {
        new ReleaseClientLibs().doRelease()
    }

    TitlePrinter titlePrinter = new TitlePrinter()
    void doRelease(){
        titlePrinter.printTitle("Identify Dependencies")
    }
}
